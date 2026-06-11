package io.agewallet.sdk.demo.ionic;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

/**
 * Dedicated callback activity for the OIDC redirect URL.
 *
 * Mirrors the Flutter demo's pattern: the netlify intent-filter lives on THIS activity
 * (not MainActivity), so when Android resolves the {@code intent://} URL from the
 * netlify callback page, it routes here instead of bringing MainActivity (which hosts
 * Capacitor's Chrome Custom Tab) to the front. Without this, MainActivity's singleTask
 * launch mode kills the Custom Tab when the intent fires — which destroys the Custom
 * Tab's session-cookie state mid-flow and causes /magic/complete to bounce back to
 * /user-login.
 *
 * After capturing the URL, this activity re-launches MainActivity with an ACTION_VIEW
 * intent carrying the URL data. Capacitor's BridgeActivity#onNewIntent processes it and
 * fires the {@code appUrlOpen} JS event for the SDK's listener.
 */
public class AgeWalletCallbackActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Uri url = getIntent() != null ? getIntent().getData() : null;

        if (url != null) {
            Intent forward = new Intent(Intent.ACTION_VIEW, url, this, MainActivity.class);
            forward.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
                | Intent.FLAG_ACTIVITY_CLEAR_TOP
                | Intent.FLAG_ACTIVITY_SINGLE_TOP
            );
            startActivity(forward);
        }

        finishAndRemoveTask();
    }
}
