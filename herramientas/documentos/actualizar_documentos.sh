#!/bin/bash
# Regenera los PDF largos (reglamento, propuesta y manual) desde los documentos de assets/Documentaciones
# y verifica que no se haya perdido ninguna palabra.   Uso:  bash herramientas/documentos/actualizar_documentos.sh [reglamento|propuesta|manual]
set -e
cd "$(dirname "$0")/../.."
H=herramientas/documentos
hacer() {
  case "$1" in
    reglamento) python3 $H/construir_reglamento.py; node $H/imprimir_pdf.mjs assets/pdf/reglamento-admision.html assets/pdf/reglamento-admision.pdf ;;
    propuesta)  python3 $H/construir_propuesta.py;  node $H/imprimir_pdf.mjs assets/pdf/propuesta-educativa-2027.html assets/pdf/propuesta-educativa-2027.pdf ;;
    manual)     python3 $H/construir_manual.py;     node $H/imprimir_pdf.mjs assets/pdf/manual-convivencia.html assets/pdf/manual-convivencia.pdf ;;
  esac
  python3 $H/verificar.py "$1"
}
if [ -n "$1" ]; then hacer "$1"; else for d in reglamento propuesta manual; do hacer $d; done; fi
