#!/bin/bash

echo "🔧 Configurando MySQL..."

# Iniciar MySQL manualmente
echo "📦 Iniciando MySQL..."
/opt/homebrew/opt/mysql/bin/mysqld_safe --datadir=/opt/homebrew/var/mysql > /dev/null 2>&1 &

# Aguardar MySQL iniciar
echo "⏳ Aguardando MySQL iniciar..."
sleep 8

# Criar banco de dados
echo "🗄️ Criando banco de dados..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS automacao_relatorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados criado com sucesso!"
    echo ""
    echo "📝 Configure o arquivo .env com:"
    echo "DATABASE_URL=mysql+pymysql://root@localhost:3306/automacao_relatorio"
else
    echo "❌ Erro ao criar banco de dados"
    echo "Tente executar manualmente:"
    echo "mysql -u root -e \"CREATE DATABASE automacao_relatorio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
fi
