`#!/bin/bash

echo "📊 Visualizando tabelas do banco de dados..."
echo ""

# Mostrar todas as tabelas
echo "📋 Tabelas existentes:"
mysql -u root automacao_relatorio -e "SHOW TABLES;" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Erro: MySQL não está rodando ou banco não existe"
    echo "💡 Execute primeiro: /opt/homebrew/opt/mysql/bin/mysqld_safe --datadir=/opt/homebrew/var/mysql &"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Estrutura da tabela products
echo "📦 Estrutura da tabela 'products':"
mysql -u root automacao_relatorio -e "DESCRIBE products;" 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Estrutura da tabela logs
echo "📝 Estrutura da tabela 'logs':"
mysql -u root automacao_relatorio -e "DESCRIBE logs;" 2>/dev/null

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Contar registros
echo "📊 Estatísticas:"
PRODUCTS_COUNT=$(mysql -u root automacao_relatorio -N -e "SELECT COUNT(*) FROM products;" 2>/dev/null)
LOGS_COUNT=$(mysql -u root automacao_relatorio -N -e "SELECT COUNT(*) FROM logs;" 2>/dev/null)

echo "  • Produtos cadastrados: ${PRODUCTS_COUNT:-0}"
echo "  • Logs de relatórios: ${LOGS_COUNT:-0}"
