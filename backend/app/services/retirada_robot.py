"""
Robô Playwright para execução de retiradas de estoque no Linx Microvix.

Fluxo por produto:
  1. Login no sistema
  2. Selecionar loja conforme informado na retirada
  3. Navegar: Menu lateral → Suprimentos → Estoque → Produtos
  4. Pesquisar produto pelo código de barras
  5. Selecionar produto nos resultados
  6. No painel lateral direito: Saldo → Ajustar Saldo
  7. Calcular novo saldo (atual - quantidade retirada) e preencher
  8. Confirmar ajuste

Variáveis de ambiente necessárias (adicionar ao .env):
  LINX_URL       = URL base do Linx Microvix (ex: https://microvix.linx.com.br)
  LINX_USERNAME  = Usuário de acesso ao Linx
  LINX_PASSWORD  = Senha de acesso ao Linx
  ROBOT_HEADLESS = "true" para rodar sem janela (produção), "false" para ver o navegador (testes)
  ROBOT_TEST_MODE= "true" para pular confirmações reais (apenas testa navegação)

Para testes visuais:
  Defina ROBOT_HEADLESS=false e ROBOT_TEST_MODE=true no .env
  O navegador abrirá visivelmente e os passos de confirmação serão pulados
"""

import asyncio
import dataclasses
import os
from dataclasses import dataclass
import time
from typing import AsyncGenerator, Callable, Awaitable
from pathlib import Path

from dotenv import load_dotenv
from playwright.async_api import async_playwright, Page, BrowserContext

# Carrega o .env explicitamente (os.getenv não lê .env automaticamente)
_env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=False)

# ── Configuração via variáveis de ambiente ─────────────────────────────────────

LINX_URL = os.getenv("LINX_URL", "")
LINX_USERNAME = os.getenv("LINX_USERNAME", "")
LINX_PASSWORD = os.getenv("LINX_PASSWORD", "")

# False = abre o navegador (bom para testes visuais)
ROBOT_HEADLESS = os.getenv("ROBOT_HEADLESS", "true").lower() == "true"

# True = pula as confirmações reais (apenas testa a navegação)
ROBOT_TEST_MODE = os.getenv("ROBOT_TEST_MODE", "false").lower() == "true"

# Mapeamento de abreviações para nomes completos de loja no sistema
LOJA_NOMES: dict[str, str] = {
    "LD": "BSTORIES - PARK SHOPPING", 
    "MECA": "BSTORIES - DISTRIBUIDORA",  
    "MARY": "BSTORIES - PATIO BRASIL",  
    "CRM": "CRM",    # TODO: Apagar essas lojas
    "LOJA": "LOJA",  # TODO: Apagar essas lojas
}


# ── Tipos de progresso ─────────────────────────────────────────────────────────

@dataclass
class RobotStep:
    """Representa um passo do robô enviado ao frontend via WebSocket."""
    step_id: str
    status: str          # "running" | "success" | "error" | "info" | "skip"
    message: str
    product_barcode: str | None = None
    product_desc: str | None = None


# Tipo do callback de progresso
ProgressCallback = Callable[[RobotStep], Awaitable[None]]


# ── Robô principal ─────────────────────────────────────────────────────────────

class LinxRetiradaRobot:
    """
    Executa o fluxo de retirada de estoque no Linx Microvix usando Playwright.

    Uso:
        robot = LinxRetiradaRobot(loja="LD", items=[...])
        success = await robot.execute(on_progress=minha_funcao_callback)

    O callback `on_progress` recebe um RobotStep a cada passo e deve ser
    uma coroutine assíncrona (async def).
    """

    def __init__(self, loja: str, items: list[dict]):
        """
        Args:
            loja: Sigla da loja ("LD", "MECA", etc.)
            items: Lista de dicts com keys: codigo_barras, descricao, codigo_linx
        """
        self.loja = loja
        self.loja_nome = LOJA_NOMES.get(loja, loja)
        self.items = items

    async def execute(self, on_progress: ProgressCallback) -> bool:
        """
        Executa o robô completo. Retorna True se todos os produtos foram processados.
        Chama `on_progress` para cada passo com o status atualizado.
        """
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(
                headless=ROBOT_HEADLESS,
                slow_mo=300 if not ROBOT_HEADLESS else 0,  # mais lento no modo visual
            )
            context = await browser.new_context(
                viewport={"width": 1280, "height": 800},
            )
            page = await context.new_page()

            try:
                success = await self._run(page, on_progress)
                return success
            except Exception as e:
                await on_progress(RobotStep(
                    step_id="fatal_error",
                    status="error",
                    message=f"Erro inesperado no robô: {str(e)}",
                ))
                return False
            finally:
                await context.close()
                await browser.close()

    async def _run(self, page: Page, on_progress: ProgressCallback) -> bool:
        """Fluxo principal de execução."""

        # ── PASSO 1: Login ────────────────────────────────────────────────────
        await on_progress(RobotStep("login", "running", "Abrindo sistema Linx Microvix..."))

        await page.goto(LINX_URL, wait_until="networkidle")

        # Usuário
        await page.locator("#f_login").fill(LINX_USERNAME)

        # Senha
        await page.locator("#f_senha").fill(LINX_PASSWORD)

        # Botão Entrar — pelo ID único
        await page.locator("#lmxta-login-btn-autenticar").click()

        # Espera a página carregar
        await page.wait_for_load_state("networkidle")
        print("Login realizado!")

        await on_progress(RobotStep("login", "success", "Login realizado com sucesso!"))

        # ── PASSO 2: Selecionar loja ─────────────────────────────────────────
        await on_progress(RobotStep(
            "select_loja", "running",
            f"Selecionando loja: {self.loja_nome}...",
        ))

        # Aguarda a lista de lojas aparecer
        await page.wait_for_selector(".company-link", timeout=10_000)

        # Busca todos os links de loja e clica no que contém o nome correto
        loja_encontrada = False
        links = await page.locator(".company-link").all()

        for link in links:
            texto = await link.locator("span").inner_text()
            if self.loja_nome in texto:
                await link.click()
                loja_encontrada = True
                break

        if not loja_encontrada:
            raise ValueError(f"Loja '{self.loja_nome}' não encontrada na lista!")

        # Aguarda a confirmação de que a loja foi selecionada
        await page.wait_for_load_state("networkidle", timeout=10_000)

        await on_progress(RobotStep(
            "select_loja", "success",
            f"Loja {self.loja_nome} selecionada!",
        ))

        # ── PASSO 3: Navegar para Suprimentos → Estoque → Produtos ──────────
        await on_progress(RobotStep(
            "navigate", "running",
            "Navegando para Suprimentos › Estoque › Produtos...",
        ))

        # Clica em "Suprimentos" no menu lateral
        await page.locator("#liModulo_8 > a.link-modulo").click()

        # Aguarda o submenu expandir e clica em "Estoque"
        await page.locator("#liModulo_8 > ul > li:first-child > a").click()

        # Clica em "Produtos" pelo atributo data-endereco (único e estável)
        await page.locator("a[data-endereco='suprimentos/index.html#/listagem-produtos']").click()

        # Aguarda a página de produtos carregar
        await page.wait_for_selector("iframe[title='Principal']", timeout=10_000)

        # O conteúdo está dentro de um iframe — precisa mudar o contexto
        frame = page.frame_locator("iframe[title='Principal']")
        await frame.locator("table, .listagem, #listagem-produtos").first.wait_for(timeout=10_000)

        await on_progress(RobotStep(
            "navigate", "success",
            "Página de produtos aberta!",
        ))

        # ── PASSO 4+: Loop por produto ───────────────────────────────────────
        errors: list[str] = []

        for idx, item in enumerate(self.items, start=1):
            barcode = item.get("codigo_barras") or ""
            desc = item.get("descricao") or barcode or f"Item #{idx}"
            # qty = 1 por bipagem. Se futuramente houver campo quantidade, usar item.get("quantidade", 1)
            qty = 1

            if not barcode:
                await on_progress(RobotStep(
                    f"skip_{idx}", "skip",
                    f"[{idx}/{len(self.items)}] Item sem código de barras — ignorado.",
                    product_barcode=None,
                    product_desc=desc,
                ))
                continue

            ok = await self._process_product(page, on_progress, idx, barcode, desc, qty)
            if not ok:
                errors.append(barcode)

        # ── Resultado final ──────────────────────────────────────────────────
        if errors:
            await on_progress(RobotStep(
                "finished", "error",
                f"Concluído com {len(errors)} erro(s). "
                f"Produtos com falha: {', '.join(errors)}",
            ))
            return False

        await on_progress(RobotStep(
            "finished", "success",
            f"Todos os {len(self.items)} produto(s) foram retirados com sucesso!",
        ))
        return True

    async def _process_product(
        self,
        page: Page,
        on_progress: ProgressCallback,
        idx: int,
        barcode: str,
        desc: str,
        qty: int,
    ) -> bool:
        """
        Executa o fluxo completo de retirada para um único produto.
        Retorna True se bem-sucedido, False em caso de erro.
        """
        prefix = f"[{idx}/{len(self.items)}]"

        try:
            # ── Passo 4: Pesquisar produto ────────────────────────────────────
            await on_progress(RobotStep(
                f"search_{barcode}", "running",
                f"{prefix} Pesquisando produto pelo código de barras...",
                product_barcode=barcode,
                product_desc=desc,
            ))

            # Tudo está dentro do iframe principal
            frame = page.frame_locator("iframe[title='Principal']")

            # Limpa e digita o código de barras no campo de pesquisa
            await frame.locator("#inputPesquisaProdutos").clear()
            await frame.locator("#inputPesquisaProdutos").fill(barcode)
            await frame.locator("#inputPesquisaProdutos").press("Enter")

            # Aguarda os resultados aparecerem
            await frame.locator("table tbody tr.cursor-pointer").first.wait_for(timeout=8_000)

            # ── Passo 5: Selecionar produto nos resultados ────────────────────
            await on_progress(RobotStep(
                f"select_{barcode}", "running",
                f"{prefix} Selecionando produto na lista de resultados...",
                product_barcode=barcode,
                product_desc=desc,
            ))

            # Clica no primeiro resultado da tabela
            await frame.locator("table tbody tr.cursor-pointer").first.click()

            # Aguarda o painel lateral abrir
            await frame.locator(".vsm--link.vsm--link_level-1:has(.vsm--title:text('Saldo'))").wait_for(timeout=5_000)

            # ── Passo 6: Abrir Saldo → Ajustar Saldo ─────────────────────────
            await on_progress(RobotStep(
                f"open_balance_{barcode}", "running",
                f"{prefix} Abrindo opção de ajuste de saldo...",
                product_barcode=barcode,
                product_desc=desc,
            ))

            # Clica em "Saldo" no painel lateral (dentro do iframe)
            await frame.locator(".vsm--link.vsm--link_level-1:has(.vsm--title:text('Saldo'))").click()

            # Aguarda submenu expandir e clica em "Ajustar saldo"
            await frame.locator("a.vsm--link.vsm--link_level-2:has(.vsm--title:text('Ajustar saldo'))").wait_for(timeout=5_000)
            await frame.locator("a.vsm--link.vsm--link_level-2:has(.vsm--title:text('Ajustar saldo'))").click()

            # Aguarda o formulário de ajuste carregar
            await page.wait_for_load_state("networkidle", timeout=10_000)

            # ── Passo 7: Calcular e preencher o novo saldo ────────────────────
            await on_progress(RobotStep(
                f"adjust_{barcode}", "running",
                f"{prefix} Calculando novo saldo (atual - {qty})...",
                product_barcode=barcode,
                product_desc=desc,
            ))

            await page.wait_for_load_state("networkidle")

            # O ajuste roda dentro do mesmo iframe Principal
            frame = page.frame_locator("iframe[title='Principal']")

            # Lê o saldo atual pelo input hidden
            saldo_atual_text = await frame.locator("input[name='velho_saldo']").get_attribute("value")
            saldo_atual = float(saldo_atual_text.replace(".", "").replace(",", ".").strip())
            novo_saldo = max(0, saldo_atual - qty)

            if not ROBOT_TEST_MODE:
                # Preenche o campo de novo saldo
                await frame.locator("input[name='novo_saldo']").triple_click()
                await frame.locator("input[name='novo_saldo']").fill(str(novo_saldo).replace(".", ","))

                # ── Passo 8: Confirmar ────────────────────────────────────────
                await on_progress(RobotStep(
                    f"confirm_{barcode}", "running",
                    f"{prefix} Confirmando retirada...",
                    product_barcode=barcode,
                    product_desc=desc,
                ))

                # Clica no botão de confirmar
                await frame.locator("input[name='B1']").click()

                # Aguarda a tela de resultado
                await frame.locator("a[href='../suprimentos/index.html#/listagem-produtos']").wait_for(timeout=8_000)

                # Valida o novo saldo na tela de resultado
                novo_saldo_confirmado = await frame.locator("tr:has(td:text('Novo Saldo')) td:last-child font b").inner_text()
                novo_saldo_confirmado = float(novo_saldo_confirmado.replace(".", "").replace(",", ".").strip())

                if novo_saldo_confirmado != novo_saldo:
                    raise ValueError(
                        f"Saldo confirmado ({novo_saldo_confirmado}) difere do esperado ({novo_saldo})!"
                    )

                await asyncio.sleep(5)

            else:
                await on_progress(RobotStep(
                    f"confirm_{barcode}", "info",
                    f"{prefix} [MODO TESTE] Confirmação pulada.",
                    product_barcode=barcode,
                    product_desc=desc,
                ))

            await on_progress(RobotStep(
                f"done_{barcode}", "success",
                f"{prefix} '{desc}' retirado com sucesso!",
                product_barcode=barcode,
                product_desc=desc,
            ))

            time.sleep(5)
            return True

        except Exception as e:
            await on_progress(RobotStep(
                f"error_{barcode}", "error",
                f"{prefix} Erro ao processar '{desc}': {str(e)}",
                product_barcode=barcode,
                product_desc=desc,
            ))
            return False
