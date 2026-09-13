import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const androidRoot = path.join(root, "android");

if (!fs.existsSync(androidRoot)) {
  console.error("Pasta android não encontrada. Execute: npx cap add android");
  process.exit(1);
}

const appId = "com.gustavo.nossotempo";
const packagePath = appId.split(".").join(path.sep);
const javaDir = path.join(androidRoot, "app", "src", "main", "java", packagePath);

fs.mkdirSync(javaDir, { recursive: true });

const mainActivity = `package ${appId};

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        enterImmersiveMode();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }

    @Override
    protected void onResume() {
        super.onResume();
        enterImmersiveMode();
    }
}
`;

fs.writeFileSync(path.join(javaDir, "MainActivity.java"), mainActivity, "utf8");

const manifestPath = path.join(androidRoot, "app", "src", "main", "AndroidManifest.xml");
let manifest = fs.readFileSync(manifestPath, "utf8");

manifest = manifest
  .replace(/android:label="[^"]*"/, 'android:label="Nosso Tempo"')
  .replace(
    /(<activity\b[^>]*android:name="\.MainActivity"[^>]*)(>)/s,
    (full, start, end) => {
      let updated = start;
      const attrs = [
        ["android:showWhenLocked", "true"],
        ["android:turnScreenOn", "true"],
        ["android:screenOrientation", "portrait"]
      ];

      for (const [key, value] of attrs) {
        const rx = new RegExp(`${key}="[^"]*"`);
        if (rx.test(updated)) {
          updated = updated.replace(rx, `${key}="${value}"`);
        } else {
          updated += `\n            ${key}="${value}"`;
        }
      }

      return updated + end;
    }
  );

fs.writeFileSync(manifestPath, manifest, "utf8");

/*
  IMPORTANTE:
  Não criamos nem alteramos:
  - res/values/colors.xml
  - res/values/ic_launcher_background.xml

  Isso evita o erro:
  "Duplicate resources: color/ic_launcher_background"
*/

console.log("Android corrigido e configurado para Nosso Tempo.");
