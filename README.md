# Nosso Tempo — projeto corrigido

Versão refeita do zero para evitar o erro de recursos duplicados do Android.

## Correção principal

Este projeto **não cria nem altera** manualmente:

- `android/app/src/main/res/values/colors.xml`
- `android/app/src/main/res/values/ic_launcher_background.xml`

Assim, não ocorre mais o erro:

`Duplicate resources: color/ic_launcher_background`

## Gerar APK pelo GitHub

1. Extraia este ZIP.
2. Envie todos os arquivos para o repositório.
3. Confirme que existe:
   `.github/workflows/main.yml`
4. Vá em **Actions**.
5. Abra **Gerar APK - Nosso Tempo**.
6. Execute o workflow.
7. Baixe o artefato **Nosso-Tempo-APK**.

O contador começa em **12/09/2026 às 16:43**.

O app usa `showWhenLocked` e `turnScreenOn`, mas não remove PIN, biometria ou a segurança padrão do Android.
