#!/bin/bash

echo "🔍 Sui CLI Balance Kontrolü"
echo "============================"
echo ""
echo "Adres: $(sui client active-address)"
echo ""
sui client gas
echo ""
echo "✅ Token görüyorsanız, deploy etmeye hazırsınız!"
echo "⚠️  Token görmüyorsanız, Slush transfer'ini kontrol edin"

