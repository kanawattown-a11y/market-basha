package com.marketbasha.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
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

        setupWebView()
        setupSwipeRefresh()
        askNotificationPermission()
        handleDeepLink(intent)
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
        
        // Improve performance
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        
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
}
