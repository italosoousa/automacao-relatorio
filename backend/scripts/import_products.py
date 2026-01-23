#!/usr/bin/env python3
"""
Script para importar produtos de uma planilha Excel para o banco de dados.

Uso:
    python scripts/import_products.py caminho/para/planilha.xlsx [--update]

Opções:
    --update: Atualiza produtos existentes em vez de ignorá-los
"""

import sys
import os
from pathlib import Path
import pandas as pd
from decimal import Decimal

# Adicionar o diretório raiz do projeto ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models.product import Product
from app.utils.parsing import norm_sku


def import_products_from_excel(file_path: str, update_existing: bool = False):
    """
    Importa produtos de uma planilha Excel.
    
    Args:
        file_path: Caminho para o arquivo Excel
        update_existing: Se True, atualiza produtos existentes
    """
    # Verificar se arquivo existe
    if not os.path.exists(file_path):
        print(f"❌ Erro: Arquivo não encontrado: {file_path}")
        return
    
    print(f"📖 Lendo planilha: {file_path}")
    
    try:
        # Ler planilha
        df = pd.read_excel(file_path, engine="openpyxl")
        
        # Normalizar nomes das colunas
        df.columns = df.columns.str.strip().str.upper()
        
        # Verificar coluna obrigatória
        if "CODIGO_LINX" not in df.columns:
            print(f"❌ Erro: Coluna 'CODIGO_LINX' não encontrada na planilha")
            print(f"   Colunas disponíveis: {', '.join(df.columns.tolist())}")
            return
        
        print(f"✅ Planilha lida com sucesso: {len(df)} linhas encontradas")
        
        # Conectar ao banco
        db = SessionLocal()
        
        created_count = 0
        updated_count = 0
        skipped_count = 0
        errors = []
        
        print("\n🔄 Processando produtos...")
        
        for index, row in df.iterrows():
            try:
                codigo_linx = str(row["CODIGO_LINX"]).strip()
                if not codigo_linx or codigo_linx.lower() in ["nan", "none", ""]:
                    skipped_count += 1
                    continue
                
                # Buscar produto existente
                existing = db.query(Product).filter(Product.codigo_linx == codigo_linx).first()
                
                # Preparar dados
                product_data = {
                    "codigo_linx": codigo_linx,
                    "descricao": str(row.get("DESCRICAO", "")).strip() if pd.notna(row.get("DESCRICAO")) else None,
                    "sku": str(row.get("SKU", "")).strip() if pd.notna(row.get("SKU")) else None,
                    "codigo_barras": str(row.get("CODIGO_BARRAS", "")).strip() if pd.notna(row.get("CODIGO_BARRAS")) else None,
                }
                
                # Processar preço
                preco = None
                for col in ["PRECO_CUSTO", "PRECO", "CUSTO"]:
                    if col in df.columns and pd.notna(row.get(col)):
                        try:
                            preco = Decimal(str(row[col]).replace(",", "."))
                            break
                        except:
                            pass
                
                product_data["preco_custo"] = preco
                
                # Remover valores vazios
                product_data = {k: v if v and v != "" else None for k, v in product_data.items()}
                
                if existing:
                    if update_existing:
                        # Atualizar
                        for key, value in product_data.items():
                            if key != "codigo_linx" and value is not None:
                                setattr(existing, key, value)
                        updated_count += 1
                        print(f"  ✓ Atualizado: {codigo_linx}")
                    else:
                        skipped_count += 1
                        print(f"  ⊘ Ignorado (já existe): {codigo_linx}")
                else:
                    # Criar novo
                    db_product = Product(**product_data)
                    db.add(db_product)
                    created_count += 1
                    print(f"  + Criado: {codigo_linx}")
                    
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
                print(f"  ✗ Erro na linha {index + 2}: {str(e)}")
                continue
        
        # Commit
        print("\n💾 Salvando no banco de dados...")
        db.commit()
        db.close()
        
        # Resumo
        print("\n" + "="*50)
        print("📊 RESUMO DA IMPORTAÇÃO")
        print("="*50)
        print(f"✅ Produtos criados: {created_count}")
        print(f"🔄 Produtos atualizados: {updated_count}")
        print(f"⊘ Produtos ignorados: {skipped_count}")
        print(f"📝 Total de linhas processadas: {len(df)}")
        
        if errors:
            print(f"\n⚠️  Erros encontrados: {len(errors)}")
            for error in errors[:10]:  # Mostra apenas os 10 primeiros
                print(f"   - {error}")
            if len(errors) > 10:
                print(f"   ... e mais {len(errors) - 10} erros")
        
        print("\n✅ Importação concluída com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao processar planilha: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python scripts/import_products.py <caminho_planilha.xlsx> [--update]")
        print("\nExemplo:")
        print("  python scripts/import_products.py produtos.xlsx")
        print("  python scripts/import_products.py produtos.xlsx --update")
        sys.exit(1)
    
    file_path = sys.argv[1]
    update_existing = "--update" in sys.argv
    
    if update_existing:
        print("⚠️  Modo UPDATE ativado - produtos existentes serão atualizados\n")
    
    import_products_from_excel(file_path, update_existing)
