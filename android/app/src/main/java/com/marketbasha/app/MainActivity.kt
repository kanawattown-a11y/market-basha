package com.marketbasha.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.firebase.messaging.FirebaseMessaging

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private val BASE_URL = "https://marketbasha.com"

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            // Permission granted, get FCM token
            getFCMTokenAndSendToWebView()
        } else {
            Toast.makeText(this, "الإشعارات ضرورية لتلقي تحديثات الطلبات", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)

        // Enable cookies BEFORE setting up WebView
        setupCookies()
        // Restore saved session if available
        restoreSavedSession()
        setupWebView()
        setupSwipeRefresh()
        askNotificationPermission()
        handleDeepLink(intent)
    }

    private fun setupCookies() {
        // Enable cookies for WebView
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        
        // For API 21+ (Lollipop and above)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, true)
        }
        
        // Ensure cookies persist across sessions
        cookieManager.flush()
    }

    private fun restoreSavedSession() {
        try {
            val prefs = getSharedPreferences("auth_prefs", MODE_PRIVATE)
            val authToken = prefs.getString("auth_token", null)
            val tokenSavedTime = prefs.getLong("token_saved_time", 0)
            
            if (authToken != null && authToken.isNotEmpty()) {
                // Check if token is still valid (90 days = 7,776,000,000 milliseconds)
                val currentTime = System.currentTimeMillis()
                val tokenAge = currentTime - tokenSavedTime
                val ninetyDaysInMillis = 90L * 24 * 60 * 60 * 1000
                
                if (tokenAge < ninetyDaysInMillis) {
                    // Token is still valid, restore it to cookies
                    val cookieManager = CookieManager.getInstance()
                    
                    // Set auth-token cookie with proper flags
                    val cookie = "auth-token=$authToken; Path=/; Max-Age=7776000; SameSite=Lax"
                    cookieManager.setCookie("https://marketbasha.com", cookie)
                    cookieManager.flush()
                    
                    println("Session restored from SharedPreferences!")
                } else {
                    // Token expired, clear it
                    prefs.edit().clear().apply()
                    println("Saved token expired, cleared from storage")
                }
            }
        } catch (e: Exception) {
            println("Failed to restore session: ${e.message}")
        }
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.allowFileAccess = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        
        // Enable caching for session persistence
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        // Note: setAppCacheEnabled is deprecated in API 33+, using default cache instead
        
        // Set User Agent (append to identify app traffic)
        settings.userAgentString = settings.userAgentString + " MarketBashaApp"

        // Add JavaScript interface for native-to-web communication
        webView.addJavascriptInterface(WebAppInterface(), "AndroidBridge")

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = MyWebViewClient(swipeRefreshLayout, this)

        // Load initial URL
        if (intent?.data == null) {
            webView.loadUrl(BASE_URL)
        }
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }
    }

    private fun askNotificationPermission() {
        // This is only necessary for API level >= 33 (Tiramisu)
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                // Permission already granted
                getFCMTokenAndSendToWebView()
            } else if (shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        } else {
            // For older Android versions, no runtime permission needed
            getFCMTokenAndSendToWebView()
        }
    }

    private fun getFCMTokenAndSendToWebView() {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                println("Fetching FCM registration token failed: ${task.exception}")
                return@addOnCompleteListener
            }

            // Get new FCM registration token
            val token = task.result
            println("FCM Token: $token")
            
            // Save token to SharedPreferences for the service to access
            val prefs = getSharedPreferences("fcm_prefs", MODE_PRIVATE)
            prefs.edit().putString("fcm_token", token).apply()

            // Send token to WebView
            runOnUiThread {
                webView.evaluateJavascript(
                    "if(window.receiveNativeFCMToken) { window.receiveNativeFCMToken('$token'); }",
                    null
                )
            }
        }
    }

    // JavaScript Interface - allows web to call native functions
    inner class WebAppInterface {
        
        @JavascriptInterface
        fun getFCMToken(): String {
            val prefs = getSharedPreferences("fcm_prefs", MODE_PRIVATE)
            return prefs.getString("fcm_token", "") ?: ""
        }

        @JavascriptInterface
        fun requestNotificationPermission() {
            runOnUiThread {
                askNotificationPermission()
            }
        }

        @JavascriptInterface
        fun isNotificationPermissionGranted(): Boolean {
            return if (Build.VERSION.SDK_INT >= 33) {
                ContextCompat.checkSelfPermission(
                    this@MainActivity, 
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
            } else {
                true
            }
        }
    }

    // Handle Back Button inside WebView
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // New Intent (Data from Deep Link while app is open)
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val data = intent?.data
        if (data != null) {
            webView.loadUrl(data.toString())
        }
    }

    // Save cookies when app is paused/stopped
    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    override fun onStop() {
        super.onStop()
        CookieManager.getInstance().flush()
    }

    override fun onDestroy() {
        super.onDestroy()
        // Final flush to ensure cookies are persisted
        CookieManager.getInstance().flush()
    }
}
