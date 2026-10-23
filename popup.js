document.addEventListener('DOMContentLoaded', () => {

    // === 1. VERSÃO DINÂMICA ===
    const versionTag = document.getElementById("version-tag");
    if (versionTag && chrome.runtime && chrome.runtime.getManifest) {
        versionTag.textContent = "v" + chrome.runtime.getManifest().version;
    }

    // === 2. ELEMENTOS ===
    const ativoInput = document.getElementById("ativo");
    const statusText = document.getElementById("status-text");
    const btnSalvar = document.getElementById("salvar");

    // Chat
    const usarAssinaturaInput = document.getElementById("usarAssinatura");
    const nomeInput = document.getElementById("nome");
    const maiusculaCheck = document.getElementById("maiuscula");
    const boldCheck = document.getElementById("bold");
    const italicCheck = document.getElementById("italic");
    const codeCheck = document.getElementById("code");
    const codeBlockCheck = document.getElementById("codeBlock");
    const quoteCheck = document.getElementById("quote");
    const newlineCheck = document.getElementById("newline");

    // Privacidade
    const blurAtivoInput = document.getElementById("blurAtivo");
    const blurListaInput = document.getElementById("blurLista");
    const blurHeaderInput = document.getElementById("blurHeader");
    const blurMidiaInput = document.getElementById("blurMidia");
    const blurNomesInput = document.getElementById("blurNomes");
    const blurPreviewInput = document.getElementById("blurPreview");

    // Section do card de privacidade (para aplicar a classe de pausa)
    const privacyCard = blurAtivoInput ? blurAtivoInput.closest('section.config-card') : null;

    // Preview
    const signaturePreview = document.getElementById("signature-preview");
    const previewText = document.getElementById("preview-text");
    const charCounter = document.getElementById("char-counter");

    // === 3. STATUS LED ===
    function atualizarTextoStatus() {
        const statusLed = document.getElementById("status-led");
        if (ativoInput.checked) {
            statusText.textContent = "Ativada";
            statusText.style.color = "var(--success)";
            if (statusLed) {
                statusLed.classList.add("pulse-active");
                statusLed.classList.remove("pulse-inactive");
            }
        } else {
            statusText.textContent = "Desativada";
            statusText.style.color = "var(--text-sub)";
            if (statusLed) {
                statusLed.classList.add("pulse-inactive");
                statusLed.classList.remove("pulse-active");
            }
        }
    }

    // === 4. PAUSA DE PRIVACIDADE ===
    function atualizarEstadoPrivacidade() {
        if (!privacyCard) return;
        if (blurAtivoInput.checked) {
            privacyCard.classList.remove('privacy-paused');
        } else {
            privacyCard.classList.add('privacy-paused');
        }
    }

    // === 5. ESMAECIMENTO DOS ESTILOS DE ASSINATURA ===
    function atualizarEstadoAssinatura() {
        const signatureStyles = [boldCheck, italicCheck, codeCheck, codeBlockCheck, quoteCheck, newlineCheck];
        const ativa = usarAssinaturaInput.checked;

        nomeInput.disabled = !ativa;
        nomeInput.style.opacity = ativa ? "1" : "0.5";

        signatureStyles.forEach(check => {
            check.disabled = !ativa;
            const row = check.closest('.option-row');
            if (row) row.style.opacity = ativa ? "1" : "0.5";
        });

        atualizarPreview();
    }

    // === 5. PRÉVIA EM TEMPO REAL DA ASSINATURA ===
    function atualizarPreview() {
        const nome = nomeInput.value.trim();
        const ativa = usarAssinaturaInput.checked;

        // Atualiza contador de caracteres
        if (charCounter) {
            charCounter.textContent = nomeInput.value.length + "/40";
        }

        if (!ativa || !nome) {
            if (signaturePreview) signaturePreview.classList.remove("visible");
            return;
        }

        // Sanitização básica
        const safeNome = nome.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        let html = safeNome + ":";

        // Aplica a formatação visual do WhatsApp
        if (codeBlockCheck && codeBlockCheck.checked) {
            html = `<span class="wp-code-block">${html}</span>`;
        } else if (codeCheck.checked) {
            html = `<span class="wp-code">${html}</span>`;
        }

        if (boldCheck.checked) {
            html = `<b>${html}</b>`;
        }
        
        if (italicCheck.checked) {
            html = `<i>${html}</i>`;
        }

        if (quoteCheck && quoteCheck.checked) {
            html = `<span class="wp-quote">${html}</span>`;
        }

        if (previewText) previewText.innerHTML = html;
        if (signaturePreview) signaturePreview.classList.add("visible");
    }

    // === 7. SALVAMENTO CENTRAL ===
    function salvarConfiguracoes() {
        chrome.storage.sync.set({
            ativo: ativoInput.checked,
            usarAssinatura: usarAssinaturaInput.checked,
            nome: nomeInput.value,
            maiuscula: maiusculaCheck.checked,
            bold: boldCheck.checked,
            italic: italicCheck.checked,
            code: codeCheck.checked,
            codeBlock: codeBlockCheck ? codeBlockCheck.checked : false,
            quote: quoteCheck ? quoteCheck.checked : false,
            newline: newlineCheck.checked,
            blurAtivo: blurAtivoInput.checked,
            blurLista: blurListaInput.checked,
            blurHeader: blurHeaderInput.checked,
            blurMidia: blurMidiaInput.checked,
            blurNomes: blurNomesInput.checked,
            blurPreview: blurPreviewInput.checked
        }, () => {
            if (chrome.runtime.lastError) return;
            const saveIndicator = document.querySelector(".save-indicator");
            if (saveIndicator) {
                saveIndicator.classList.add("visible");
                setTimeout(() => saveIndicator.classList.remove("visible"), 1500);
            }
        });
    }

    // === 8. CARREGAR CONFIGURAÇÕES ===
    chrome.storage.sync.get(
        ['ativo', 'usarAssinatura', 'blurAtivo', 'blurLista', 'blurHeader', 'blurMidia', 'blurNomes', 'blurPreview',
            'nome', 'maiuscula', 'bold', 'italic', 'code', 'codeBlock', 'quote', 'newline'],
        (items) => {
            if (chrome.runtime.lastError) return;

            ativoInput.checked = items.ativo !== undefined ? items.ativo : true;
            usarAssinaturaInput.checked = !!items.usarAssinatura;
            if (items.nome) nomeInput.value = items.nome;
            maiusculaCheck.checked = !!items.maiuscula;
            boldCheck.checked = items.bold !== undefined ? items.bold : true;
            italicCheck.checked = !!items.italic;
            codeCheck.checked = !!items.code;
            if (codeBlockCheck) codeBlockCheck.checked = !!items.codeBlock;
            if (quoteCheck) quoteCheck.checked = !!items.quote;
            newlineCheck.checked = !!items.newline;

            blurAtivoInput.checked = items.blurAtivo !== undefined ? items.blurAtivo : true;
            blurListaInput.checked = !!items.blurLista;
            blurHeaderInput.checked = !!items.blurHeader;
            blurMidiaInput.checked = !!items.blurMidia;
            blurNomesInput.checked = !!items.blurNomes;
            blurPreviewInput.checked = !!items.blurPreview;

            atualizarTextoStatus();
            atualizarEstadoAssinatura();
            atualizarEstadoPrivacidade();
        }
    );

    // === 9. BIND DE EVENTOS ===
    ativoInput.addEventListener('change', () => {
        atualizarTextoStatus();
        salvarConfiguracoes();
    });

    usarAssinaturaInput.addEventListener('change', () => {
        atualizarEstadoAssinatura();
        salvarConfiguracoes();
    });

    // Exclusividade mútua entre código inline e bloco de código
    if (codeCheck && codeBlockCheck) {
        codeCheck.addEventListener('change', () => {
            if (codeCheck.checked) codeBlockCheck.checked = false;
        });
        codeBlockCheck.addEventListener('change', () => {
            if (codeBlockCheck.checked) codeCheck.checked = false;
        });
    }

    // Switches de estilo também atualizam o preview
    [boldCheck, italicCheck, codeCheck, codeBlockCheck, quoteCheck].forEach(el => {
        if (el) el.addEventListener('change', () => {
            atualizarPreview();
        });
    });

    blurAtivoInput.addEventListener('change', () => {
        atualizarEstadoPrivacidade();
        salvarConfiguracoes();
    });

    const allSwitches = [
        usarAssinaturaInput, maiusculaCheck, boldCheck, italicCheck,
        codeCheck, codeBlockCheck, quoteCheck, newlineCheck, blurListaInput, blurHeaderInput,
        blurMidiaInput, blurNomesInput, blurPreviewInput
    ];
    allSwitches.forEach(el => { if (el) el.addEventListener('change', salvarConfiguracoes) });

    // Debounce no input de texto
    let debounceTimeout;
    nomeInput.addEventListener('input', () => {
        atualizarPreview();
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(salvarConfiguracoes, 300);
    });

    // Botão Fechar da titlebar
    const btnTitlebarFechar = document.getElementById("btnTitlebarFechar");
    if (btnTitlebarFechar) {
        btnTitlebarFechar.addEventListener('click', () => window.close());
    }

    // Botão fechar principal
    if (btnSalvar) {
        btnSalvar.addEventListener('click', () => window.close());
    }
});