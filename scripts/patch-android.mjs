import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const androidRoot = path.join(root, "android");

if (!fs.existsSync(androidRoot)) {
  console.error("❌ Pasta android não encontrada.");
  console.error("Execute primeiro: npx cap add android");
  process.exit(1);
}

const appId = "com.gustavo.nossotempo";
const packagePath = appId.split(".").join(path.sep);

const javaDir = path.join(
  androidRoot,
  "app",
  "src",
  "main",
  "java",
  packagePath
);

fs.mkdirSync(javaDir, {
  recursive: true
});


/* ==================================================
   MAIN ACTIVITY
================================================== */

const mainActivity = `package ${appId};

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private void enterImmersiveMode() {

        getWindow()
            .getDecorView()
            .setSystemUiVisibility(

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


        /*
         * Permite que o Nosso Tempo apareça
         * sobre a tela bloqueada.
         */

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {

            setShowWhenLocked(true);
            setTurnScreenOn(true);

        } else {

            getWindow().addFlags(

                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                    | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }


        /*
         * Mantém a tela ligada enquanto
         * o aplicativo estiver aberto.
         */

        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );


        enterImmersiveMode();
    }


    @Override
    public void onWindowFocusChanged(boolean hasFocus) {

        super.onWindowFocusChanged(hasFocus);

        if (hasFocus) {
            enterImmersiveMode();
        }
    }


    @Override
    public void onResume() {

        super.onResume();

        enterImmersiveMode();
    }
}
`;


const mainActivityPath = path.join(
  javaDir,
  "MainActivity.java"
);


fs.writeFileSync(
  mainActivityPath,
  mainActivity,
  "utf8"
);


console.log("✅ MainActivity.java criado corretamente.");



/* ==================================================
   ANDROID MANIFEST
================================================== */

const manifestPath = path.join(
  androidRoot,
  "app",
  "src",
  "main",
  "AndroidManifest.xml"
);


if (!fs.existsSync(manifestPath)) {

  console.error(
    "❌ AndroidManifest.xml não encontrado."
  );

  process.exit(1);
}


let manifest = fs.readFileSync(
  manifestPath,
  "utf8"
);



/* ==================================================
   NOME DO APP
================================================== */

const applicationRegex =
  /<application\b[\s\S]*?>/m;


manifest = manifest.replace(
  applicationRegex,
  (applicationTag) => {

    if (/android:label\s*=/.test(applicationTag)) {

      return applicationTag.replace(
        /android:label\s*=\s*["'][^"']*["']/,
        'android:label="Nosso Tempo"'
      );

    }

    return applicationTag.replace(
      />$/,
      '\n        android:label="Nosso Tempo">'
    );
  }
);



/* ==================================================
   LOCALIZAR MAIN ACTIVITY
================================================== */

/*
 * Aceita:
 *
 * android:name=".MainActivity"
 *
 * ou
 *
 * android:name="com.gustavo.nossotempo.MainActivity"
 *
 * ou qualquer outro caminho que termine em MainActivity
 */

const activityRegex =
  /<activity\b[\s\S]*?android:name\s*=\s*["'][^"']*MainActivity["'][\s\S]*?>/m;


const activityMatch =
  manifest.match(activityRegex);


if (!activityMatch) {

  console.error(
    "❌ MainActivity não encontrada no AndroidManifest.xml"
  );

  console.log(
    "Conteúdo atual do Manifest:"
  );

  console.log(manifest);

  process.exit(1);
}



let activityTag =
  activityMatch[0];



/* ==================================================
   FUNÇÃO PARA ADICIONAR ATRIBUTOS
================================================== */

function setActivityAttribute(
  tag,
  attribute,
  value
) {

  const escaped =
    attribute.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );


  const attributeRegex =
    new RegExp(
      `${escaped}\\s*=\\s*["'][^"']*["']`
    );


  if (attributeRegex.test(tag)) {

    return tag.replace(
      attributeRegex,
      `${attribute}="${value}"`
    );
  }


  if (tag.endsWith("/>")) {

    return (
      tag.slice(0, -2)
      + `\n        ${attribute}="${value}"\n    />`
    );
  }


  return (
    tag.slice(0, -1)
    + `\n        ${attribute}="${value}">`
  );
}



/* ==================================================
   CONFIGURAÇÕES DA ACTIVITY
================================================== */

activityTag =
  setActivityAttribute(
    activityTag,
    "android:showWhenLocked",
    "true"
  );


activityTag =
  setActivityAttribute(
    activityTag,
    "android:turnScreenOn",
    "true"
  );


activityTag =
  setActivityAttribute(
    activityTag,
    "android:screenOrientation",
    "portrait"
  );


activityTag =
  setActivityAttribute(
    activityTag,
    "android:launchMode",
    "singleTask"
  );


manifest = manifest.replace(
  activityRegex,
  activityTag
);



/* ==================================================
   SALVAR MANIFEST
================================================== */

fs.writeFileSync(
  manifestPath,
  manifest,
  "utf8"
);


console.log(
  "✅ AndroidManifest.xml encontrado."
);

console.log(
  "✅ MainActivity configurada."
);

console.log(
  "✅ showWhenLocked ativado."
);

console.log(
  "✅ turnScreenOn ativado."
);

console.log(
  "✅ Tela em modo retrato."
);

console.log(
  "✅ Nosso Tempo configurado corretamente."
);
