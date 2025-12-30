package com.marketbasha.app

import android.webkit.WebView
import android.webkit.WebViewClient
import android.content.Intent
import android.net.Uri
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MyWebViewClient(
    private val swipeRefreshLayout: SwipeRefreshLayout
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
    }
}
