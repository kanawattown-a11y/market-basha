package com.marketbasha.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.net.HttpURLConnection
import java.net.URL

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        println("New FCM Token: $token")
        
        // Save token to SharedPreferences
        val prefs = getSharedPreferences("fcm_prefs", Context.MODE_PRIVATE)
        prefs.edit().putString("fcm_token", token).apply()
        
        // Send token to server in background
        sendTokenToServer(token)
    }

    private fun sendTokenToServer(token: String) {
        Thread {
            try {
                val url = URL("https://marketbasha.com/api/push/subscribe")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Accept", "application/json")
                
                // Get auth cookie from SharedPreferences if available
                val prefs = getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
                val authCookie = prefs.getString("auth_cookie", null)
                if (authCookie != null) {
                    connection.setRequestProperty("Cookie", authCookie)
                }
                
                val body = """{"token":"$token","platform":"android"}"""
                connection.outputStream.use { os ->
                    os.write(body.toByteArray())
                }
                
                val responseCode = connection.responseCode
                println("Token sent to server, response: $responseCode")
                connection.disconnect()
            } catch (e: Exception) {
                println("Failed to send token to server: ${e.message}")
            }
        }.start()
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Check if message contains a notification payload.
        remoteMessage.notification?.let {
            sendNotification(it.title, it.body, remoteMessage.data)
        }

        // Check if message contains a data payload (for background)
        if (remoteMessage.data.isNotEmpty()) {
            val title = remoteMessage.data["title"] ?: "Market Basha"
            val body = remoteMessage.data["body"] ?: remoteMessage.data["message"]
            
            // If no notification payload was present, create notification manually
            if (remoteMessage.notification == null && body != null) {
                sendNotification(title, body, remoteMessage.data)
            }
        }
    }

    private fun sendNotification(title: String?, body: String?, data: Map<String, String>) {
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        
        // Handle deep link / navigation
        val clickAction = data["clickAction"] ?: data["url"] ?: data["link"]
        if (clickAction != null) {
            if (clickAction.startsWith("http")) {
                intent.data = Uri.parse(clickAction)
            } else {
                intent.data = Uri.parse("https://marketbasha.com$clickAction")
            }
        }
        
        // Add data to intent for handling in MainActivity
        data.forEach { (key, value) ->
            intent.putExtra(key, value)
        }

        val pendingIntent = PendingIntent.getActivity(
            this, System.currentTimeMillis().toInt(), intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "market_basha_default_channel"
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title ?: "Market Basha")
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create notification channel for Android O+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Market Basha Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "إشعارات تطبيق ماركت باشا"
                enableLights(true)
                lightColor = Color.GREEN
                enableVibration(true)
                vibrationPattern = longArrayOf(100, 200, 100, 200)
            }
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }
}
