package com.marketbasha.app

import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.CookieManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MyWebViewClient(
    private val swipeRefreshLayout: SwipeRefreshLayout,
    private val context: Context
) : WebViewClient() {

    override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
        url?.let {
            if (it.contains("marketbasha.com")) {
                // Internal link, load in WebView
                return false
            } else {
                // External link (e.g., Whatsapp, Maps), open in system browser/app
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(it))
                    view?.context?.startActivity(intent)
                    return true
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
        }
        return false
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // Stop refresh animation when page loads
        swipeRefreshLayout.isRefreshing = false
        
        // Save auth cookies for the Firebase service to use
        saveAuthCookies()
        
        // Inject JavaScript to auto-subscribe to notifications when user is logged in
        view?.evaluateJavascript("""
            (function() {
                // Check if user is logged in by looking for account menu or session
                setTimeout(function() {
                    if (window.AndroidBridge && typeof window.receiveNativeFCMToken === 'undefined') {
                        // Define the function to receive token from native
                        window.receiveNativeFCMToken = function(token) {
                            console.log('Native FCM Token received:', token);
                            fetch('/api/push/subscribe', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token: token })
                            }).then(function(res) {
                                console.log('Token registered:', res.ok);
                            }).catch(function(err) {
                                console.error('Token registration failed:', err);
                            });
                        };
                        
                        // Request token from native
                        var token = window.AndroidBridge.getFCMToken();
                        if (token && token.length > 0) {
                            window.receiveNativeFCMToken(token);
                        }
                    }
                }, 2000);
            })();
        """.trimIndent(), null)
    }
    
    private fun saveAuthCookies() {
        try {
            val cookieManager = CookieManager.getInstance()
            val cookies = cookieManager.getCookie("https://marketbasha.com")
            
            if (cookies != null && cookies.contains("auth-token")) {
                // Save cookies for the Firebase service
                val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                prefs.edit().putString("auth_cookie", cookies).apply()
                println("Auth cookies saved successfully")
            }
        } catch (e: Exception) {
            println("Failed to save auth cookies: ${e.message}")
        }
    }
}
