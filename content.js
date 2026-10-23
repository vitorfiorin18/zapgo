(function () {

    // =================================================================
    // 1. CAMADA VISUAL (BLUR/PRIVACIDADE)
    // =================================================================
    const style = document.createElement('style');
    style.id = 'zapgo-privacy-style';
    style.innerHTML = `
        :root { 
            --blur-strength: 6px; 
            --radius-avatar: 50%;
            --radius-media: 10px;
            --radius-text: 6px;
            --transition: 0.2s ease-in-out; 
        }
        
        /* FOTOS DA LISTA */
        body.zapgo-blur-lista div[id='pane-side'] img:not(.emoji):not([class*='emoji']) { filter: blur(12px) !important; border-radius: var(--radius-avatar) !important; transition: var(--transition); }
        body.zapgo-blur-lista div[id='pane-side'] div:has(> img):hover img:not(.emoji):not([class*='emoji']) { filter: none !important; }
        
        /* TOPO */
        body.zapgo-blur-topo div[id='main'] header img { filter: blur(12px) !important; border-radius: var(--radius-avatar) !important; transition: var(--transition); }
        body.zapgo-blur-topo div[id='main'] header:hover img { filter: none !important; }
        
        /* MÍDIAS */
        body.zapgo-blur-midia div[id='main'] div[data-id] img,
        body.zapgo-blur-midia div[id='main'] div[data-id] video,
        body.zapgo-blur-midia div[id='main'] div[data-id] div[style*='background-image'] { filter: blur(20px) !important; border-radius: var(--radius-media) !important; transition: var(--transition); }
        body.zapgo-blur-midia div[id='main'] div[data-id] img:hover,
        body.zapgo-blur-midia div[id='main'] div[data-id] video:hover,
        body.zapgo-blur-midia div[id='main'] div[data-id] div[style*='background-image']:hover { filter: none !important; }
        
        /* NOMES — limitado ao painel lateral e cabeçalho do chat (evita borrar link preview) */
        body.zapgo-blur-nomes div[id='pane-side'] span[title][dir],
        body.zapgo-blur-nomes div[id='main'] header span[title][dir] { filter: blur(var(--blur-strength)) !important; transition: var(--transition); border-radius: var(--radius-text) !important; padding: 2px 12px !important; margin: 0 -4px !important; display: inline-block !important; vertical-align: middle !important; }
        body.zapgo-blur-nomes div[id='pane-side'] span[title][dir]:hover,
        body.zapgo-blur-nomes div[id='main'] header span[title][dir]:hover { filter: none !important; box-shadow: none !important; margin: 0 !important; }
        
        /* PREVIEW */
        body.zapgo-blur-preview div[id='pane-side'] span[title]:not([dir]) { filter: blur(var(--blur-strength)) !important; transition: var(--transition); opacity: 0.6; border-radius: var(--radius-text) !important; display: inline-flex !important; align-items: center; padding: 0 10px !important; }
        body.zapgo-blur-preview div[id='pane-side'] span[title]:not([dir]) * { filter: blur(var(--blur-strength)) !important; }
        body.zapgo-blur-preview div[id='pane-side'] span[title]:not([dir]):hover, body.zapgo-blur-preview div[id='pane-side'] span[title]:not([dir]):hover * { filter: none !important; opacity: 1 !important; }
    `;
    document.head.appendChild(style);

    function atualizarBlur(config) {
        const b = document.body.classList;
        // Desativa tudo se a extensão estiver off OU se a privacidade estiver pausada
        if (config.ativo === false || config.blurAtivo === false) {
            b.remove('zapgo-blur-lista', 'zapgo-blur-topo', 'zapgo-blur-midia', 'zapgo-blur-nomes', 'zapgo-blur-preview');
            return;
        }
        config.blurLista   ? b.add('zapgo-blur-lista')    : b.remove('zapgo-blur-lista');
        config.blurHeader  ? b.add('zapgo-blur-topo')     : b.remove('zapgo-blur-topo');
        config.blurMidia   ? b.add('zapgo-blur-midia')    : b.remove('zapgo-blur-midia');
        config.blurNomes   ? b.add('zapgo-blur-nomes')    : b.remove('zapgo-blur-nomes');
        config.blurPreview ? b.add('zapgo-blur-preview')  : b.remove('zapgo-blur-preview');
    }

    // =================================================================
    // 2. CONFIGURAÇÕES E ESTADO
    // =================================================================
    let extensaoAtiva = true;
    let nomeAtual = "";
    let usarMaiusculaInicial = false; 
    let usarBold = true;
    let usarItalic = false;
    let usarNovaLinha = false;
    let usarCode = false;
    let usarCodeBlock = false;
    let usarQuote = false;
    let usarAssinatura = false;

    let isProgrammaticPaste = false;

    const keys = [
        "ativo", "nome", "maiuscula", "bold", "italic", "newline", "code", "codeBlock", "quote", "usarAssinatura",
        "blurAtivo", "blurLista", "blurHeader", "blurMidia", "blurNomes", "blurPreview"
    ];

    chrome.storage.sync.get(keys, (res) => {
        extensaoAtiva = res.ativo !== undefined ? res.ativo : true;
        nomeAtual = res.nome || "";
        usarMaiusculaInicial = !!res.maiuscula;
        usarBold = res.bold !== undefined ? res.bold : true;
        usarItalic = !!res.italic;
        usarNovaLinha = !!res.newline;
        usarCode = !!res.code;
        usarCodeBlock = !!res.codeBlock;
        usarQuote = !!res.quote;
        usarAssinatura = !!res.usarAssinatura;

        atualizarBlur(res);
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.ativo) extensaoAtiva = changes.ativo.newValue;
        if (changes.nome) nomeAtual = changes.nome.newValue || "";
        if (changes.maiuscula) usarMaiusculaInicial = !!changes.maiuscula.newValue;
        if (changes.bold) usarBold = !!changes.bold.newValue;
        if (changes.italic) usarItalic = !!changes.italic.newValue;
        if (changes.newline) usarNovaLinha = !!changes.newline.newValue;
        if (changes.code) usarCode = !!changes.code.newValue;
        if (changes.codeBlock) usarCodeBlock = !!changes.codeBlock.newValue;
        if (changes.quote) usarQuote = !!changes.quote.newValue;
        if (changes.usarAssinatura) usarAssinatura = !!changes.usarAssinatura.newValue;

        // Reaplica todos os blurs (incluindo blurAtivo) sempre que qualquer config mudar
        chrome.storage.sync.get(keys, (res) => atualizarBlur(res));
    });

    // =================================================================
    // 3. LÓGICA DE ASSINATURA
    // =================================================================
    function getPrefixoTexto() {
        if (!extensaoAtiva || !usarAssinatura || !nomeAtual || nomeAtual.trim() === "") return "";

        let texto = nomeAtual + ":";
        if (usarCodeBlock) texto = `\`\`\`${texto}\`\`\``;  // 1º: bloco de código (mais interno)
        if (usarCode)   texto = `\`${texto}\``;  // 2º: código inline
        if (usarBold)   texto = `*${texto}*`;     // 3º: negrito
        if (usarItalic) texto = `_${texto}_`;     // 4º: itálico
        if (usarQuote)  texto = `> ${texto}`;     // 5º: citação (mais externo)

        return texto;
    }

    // Seletor para identificar a caixa de texto ativa no WhatsApp Web
    const INPUT_SELECTOR = '[contenteditable="true"][data-tab="10"], div.selectable-text[contenteditable="true"]';

    // =================================================================
    // 4. LÓGICA CENTRALIZADA (DELEGAÇÃO DE EVENTOS)
    // =================================================================

    // Evento de Digitação (KeyDown)
    document.addEventListener("keydown", (e) => {
        if (!extensaoAtiva) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        // Verifica se o alvo do evento é a caixa de texto
        const input = e.target.closest(INPUT_SELECTOR);
        if (!input) return;

        // Se o campo estiver vazio, garante que o dataset está como true
        if (input.innerText.trim().length === 0) {
            input.dataset.zapgoPrimeiraLetra = "true";
        }

        const primeiraLetra = input.dataset.zapgoPrimeiraLetra !== "false";

        // Tecla de escrita comum
        if (primeiraLetra && e.key.length === 1) {
            const prefixo = getPrefixoTexto();
            const temAssinatura = prefixo.length > 0;
            const letra = usarMaiusculaInicial ? e.key.toUpperCase() : e.key;

            // CASO 1: TEM ASSINATURA ATIVADA
            const assinaturaLimpa = nomeAtual + ":";
            if (temAssinatura && !input.innerText.trim().startsWith(assinaturaLimpa)) {
                e.preventDefault();
                
                const separador = usarNovaLinha ? "\n" : " ";
                const textoParaColar = prefixo + separador + letra;
                
                copiarEColar(input, textoParaColar);
                input.dataset.zapgoPrimeiraLetra = "false";
                return;
            }

            // CASO 2: SEM ASSINATURA, MAS QUER MAIÚSCULA
            if (!temAssinatura && usarMaiusculaInicial) {
                // \p{L} suporta qualquer letra (incluindo acentuadas como é, á, ç)
                if (/^\p{L}$/u.test(e.key)) {
                    e.preventDefault();
                    copiarEColar(input, letra);
                }
                input.dataset.zapgoPrimeiraLetra = "false";
                return;
            }

            // CASO 3: SEM ASSINATURA E SEM MAIÚSCULA (ou qualquer outro caractere inicial como número/símbolo)
            input.dataset.zapgoPrimeiraLetra = "false";
        }

        // Enter sem shift envia → reseta. Shift+Enter quebra linha → NÃO reseta (evita assinatura duplicada)
        if (e.key === "Enter" && !e.shiftKey) {
            input.dataset.zapgoPrimeiraLetra = "true";
        }
    }, true);

    // Evento ao Digitar/Apagar (Input)
    document.addEventListener("input", (e) => {
        const input = e.target.closest(INPUT_SELECTOR);
        if (!input) return;

        if (input.innerText.trim().length === 0) {
            input.dataset.zapgoPrimeiraLetra = "true";
        }
    });

    // Evento de Clique
    document.addEventListener("click", (e) => {
        const input = e.target.closest(INPUT_SELECTOR);
        if (!input) return;

        if (input.innerText.trim().length === 0) {
            input.dataset.zapgoPrimeiraLetra = "true";
        }
    });

    // Evento ao Colar (Paste)
    document.addEventListener("paste", (e) => {
        if (!extensaoAtiva || isProgrammaticPaste) return;

        const input = e.target.closest(INPUT_SELECTOR);
        if (!input) return;

        // Ignora se for colar imagem/mídia
        const items = (e.clipboardData || window.clipboardData).items;
        let temImagem = false;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) temImagem = true;
        }
        if (temImagem) return;

        const campoEstaVazio = input.innerText.trim().length === 0;
        const primeiraLetra = input.dataset.zapgoPrimeiraLetra !== "false";

        if (primeiraLetra || campoEstaVazio) {
            const pastedText = (e.clipboardData || window.clipboardData).getData('text/plain');
            if (!pastedText) return;

            const prefixo = getPrefixoTexto();
            if (prefixo.length > 0) {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                const separador = usarNovaLinha ? "\n" : " ";
                const finalText = prefixo + separador + pastedText;

                copiarEColar(input, finalText);
                input.dataset.zapgoPrimeiraLetra = "false";
            }
        }
    }, true);

    // Função auxiliar usando Clipboard API fake (Simula Colar de forma moderna e limpa)
    function copiarEColar(input, texto) {
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', texto);
        
        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true, cancelable: true
        });
        
        isProgrammaticPaste = true;
        input.dispatchEvent(pasteEvent);
        isProgrammaticPaste = false;
    }
})();