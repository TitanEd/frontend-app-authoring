# TinyMCE language packs

`ar.js`, `es_MX.js` and `hi.js` are TinyMCE's own language packs, unchanged apart from the
two comment lines at the top:

| File | Source (npm `tinymce-i18n`) | Used for |
|---|---|---|
| `ar.js` | `langs5/ar.js` | Arabic |
| `es_MX.js` | `langs5/es_MX.js` | Latin American Spanish (`es-419`) |
| `hi.js` | `langs6/hi.js` (TinyMCE 5 has no Hindi pack; the keys are the same English labels) | Hindi |

They are distributed by Tiny Technologies (https://www.tiny.cloud/get-tiny/language-packages/)
under the terms of the TinyMCE version they belong to; TinyMCE itself is already a dependency
of this app.

`index.js` registers them, adds the labels of this app's own toolbar buttons and plugins, and
gives `tinyMceLanguage(locale)`, which `hooks.ts` passes to the editor as `language`.

To add a language: copy its pack here, import it in `index.js`, add its labels to `extras` and
its locale to `LANGUAGE_BY_LOCALE`.
