/**
 * ============================================================
 * METAFLOW PRO - JAVASCRIPT COMPLETO
 * ============================================================
 * Arquivo: script.js
 * Versão: 4.0
 * Tecnologias: JavaScript (Vanilla) + localStorage
 * Descrição: Todas as funcionalidades da aplicação
 * ============================================================
 */

// ============================================================
// 1. SISTEMA DE AUTENTICAÇÃO (LOGIN / CADASTRO / LOGOUT)
// ============================================================

let usuarioAtual = null;

/**
 * Alterna para o formulário de cadastro
 */
function mostrarCadastro() {
    document.getElementById('formLogin').style.display = 'none';
    document.getElementById('formCadastro').style.display = 'block';
}

/**
 * Alterna para o formulário de login
 */
function mostrarLogin() {
    document.getElementById('formLogin').style.display = 'block';
    document.getElementById('formCadastro').style.display = 'none';
}

/**
 * Realiza o cadastro de um novo usuário
 * - Valida se os campos foram preenchidos
 * - Verifica se o usuário já existe
 * - Salva no localStorage
 */
function fazerCadastro() {
    const user = document.getElementById('cadastroUser').value.trim();
    const pass = document.getElementById('cadastroPass').value.trim();

    // Validações
    if (!user || !pass) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }

    if (user.length < 3) {
        alert('⚠️ Usuário deve ter pelo menos 3 caracteres!');
        return;
    }

    if (pass.length < 4) {
        alert('⚠️ Senha deve ter pelo menos 4 caracteres!');
        return;
    }

    // Busca usuários existentes
    const usuarios = JSON.parse(localStorage.getItem('metaflow_usuarios') || '{}');

    if (usuarios[user]) {
        alert('❌ Usuário já existe! Tente outro nome.');
        return;
    }

    // Cria novo usuário
    usuarios[user] = { senha: pass, metas: [] };
    localStorage.setItem('metaflow_usuarios', JSON.stringify(usuarios));

    alert('✅ Cadastro realizado com sucesso! Faça login.');
    mostrarLogin();
}

/**
 * Realiza o login do usuário
 * - Verifica se usuário e senha existem
 * - Carrega os dados do usuário
 * - Exibe o aplicativo principal
 */
function fazerLogin() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();

    if (!user || !pass) {
        alert('⚠️ Preencha todos os campos!');
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('metaflow_usuarios') || '{}');

    if (!usuarios[user] || usuarios[user].senha !== pass) {
        alert('❌ Usuário ou senha incorretos!');
        return;
    }

    usuarioAtual = user;
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('appContainer').classList.add('ativo');
    document.getElementById('nomeUsuario').textContent = user;

    carregarMetas();
    atualizarDashboard();
}

/**
 * Realiza o logout do usuário
 * - Volta para a tela de login
 * - Limpa o usuário atual
 */
function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        usuarioAtual = null;
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('appContainer').classList.remove('ativo');
    }
}

// ============================================================
// 2. GERENCIAMENTO DE DADOS (localStorage)
// ============================================================

/**
 * Recupera as metas do usuário atual
 * @returns {Array} Lista de metas do usuário
 */
function getMetas() {
    const usuarios = JSON.parse(localStorage.getItem('metaflow_usuarios') || '{}');
    if (usuarioAtual && usuarios[usuarioAtual]) {
        return usuarios[usuarioAtual].metas || [];
    }
    return [];
}

/**
 * Salva as metas do usuário atual
 * @param {Array} metas - Lista de metas a serem salvas
 */
function salvarMetas(metas) {
    const usuarios = JSON.parse(localStorage.getItem('metaflow_usuarios') || '{}');
    if (usuarioAtual && usuarios[usuarioAtual]) {
        usuarios[usuarioAtual].metas = metas;
        localStorage.setItem('metaflow_usuarios', JSON.stringify(usuarios));
    }
}

// ============================================================
// 3. NAVEGAÇÃO ENTRE PÁGINAS
// ============================================================

/**
 * Troca a página ativa
 * @param {string} paginaId - ID da página a ser exibida
 */
function mudarPagina(paginaId) {
    // Esconde todas as páginas
    document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
    // Mostra a página selecionada
    document.getElementById(`pagina-${paginaId}`).classList.add('ativa');

    // Atualiza o menu
    document.querySelectorAll('.btn-nav').forEach(b => {
        b.classList.remove('ativo');
        if (b.dataset.pagina === paginaId) b.classList.add('ativo');
    });

    // Atualiza dashboard se for a página de dashboard
    if (paginaId === 'dashboard') atualizarDashboard();
}

// Configura os botões do menu
document.querySelectorAll('.btn-nav').forEach(btn => {
    btn.addEventListener('click', () => mudarPagina(btn.dataset.pagina));
});

/**
 * Navega para a página de metas
 */
function irParaMetas() {
    mudarPagina('metas');
}

// ============================================================
// 4. RENDERIZAÇÃO DA LISTA DE METAS
// ============================================================

/**
 * Renderiza a lista de metas na tela
 * - Cria cards para cada meta
 * - Adiciona checkbox, texto, categoria, prioridade e botão excluir
 */
function mostrarMetas() {
    const metas = getMetas();
    const lista = document.getElementById('listaMetas');
    lista.innerHTML = '';

    // Mensagem quando não há metas
    if (metas.length === 0) {
        lista.innerHTML = `
            <div class="sem-metas">
                <i class="fas fa-inbox"></i>
                <br>
                Nenhuma meta cadastrada
                <br>
                <span style="font-size:14px;">Adicione sua primeira meta acima</span>
            </div>
        `;
        return;
    }

    // Renderiza cada meta
    metas.forEach((meta, index) => {
        const div = document.createElement('div');
        div.className = 'meta-item';

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'meta-checkbox';
        checkbox.checked = meta.feito || false;
        checkbox.onclick = () => {
            const m = getMetas();
            m[index].feito = !m[index].feito;
            salvarMetas(m);
            mostrarMetas();
            atualizarContador();
            atualizarDashboard();
        };

        // Texto da meta
        const texto = document.createElement('span');
        texto.className = 'meta-texto';
        texto.textContent = meta.texto;
        if (meta.feito) texto.classList.add('concluida');

        // Badge de categoria
        const categoria = document.createElement('span');
        categoria.className = 'categoria-badge';
        categoria.textContent = meta.categoria || '🎯 Outros';

        // Badge de prioridade
        const prioridade = document.createElement('span');
        prioridade.className = `prioridade-badge ${meta.prioridade || 'media'}`;
        const prioridadeLabels = {
            'alta': '🔴 Alta',
            'media': '🟡 Média',
            'baixa': '🟢 Baixa'
        };
        prioridade.textContent = prioridadeLabels[meta.prioridade] || '🟡 Média';

        // Botão excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'btn-excluir';
        btnExcluir.innerHTML = '<i class="fas fa-trash"></i>';
        btnExcluir.title = 'Excluir meta';
        btnExcluir.onclick = () => {
            if (confirm(`Tem certeza que deseja excluir "${meta.texto}"?`)) {
                const m = getMetas();
                m.splice(index, 1);
                salvarMetas(m);
                mostrarMetas();
                atualizarContador();
                atualizarDashboard();
            }
        };

        // Monta o card
        div.appendChild(checkbox);
        div.appendChild(texto);
        div.appendChild(categoria);
        div.appendChild(prioridade);
        div.appendChild(btnExcluir);
        lista.appendChild(div);
    });
}

// ============================================================
// 5. ADICIONAR NOVA META
// ============================================================

/**
 * Adiciona uma nova meta à lista do usuário
 * - Valida se o campo não está vazio
 * - Adiciona categoria e prioridade
 * - Salva e atualiza a tela
 */
function adicionarMeta() {
    const input = document.getElementById('novaMetaInput');
    const texto = input.value.trim();
    const categoria = document.getElementById('categoriaSelect').value;
    const prioridade = document.getElementById('prioridadeSelect').value;

    // Validação
    if (!texto) {
        alert('⚠️ Digite uma meta válida!');
        input.focus();
        return;
    }

    if (texto.length > 100) {
        alert('⚠️ A meta não pode ter mais de 100 caracteres!');
        input.focus();
        return;
    }

    // Adiciona a meta
    const metas = getMetas();
    metas.push({
        id: Date.now(),
        texto: texto,
        categoria: categoria,
        prioridade: prioridade,
        feito: false,
        data: new Date().toLocaleDateString('pt-BR')
    });

    salvarMetas(metas);
    input.value = '';
    input.focus();
    mostrarMetas();
    atualizarContador();
    atualizarDashboard();
}

// ============================================================
// 6. ATUALIZAÇÃO DO CONTADOR E BARRA DE PROGRESSO
// ============================================================

/**
 * Atualiza o contador de progresso e a barra
 * - Calcula metas concluídas e percentual
 * - Exibe alerta quando 100% é atingido
 */
function atualizarContador() {
    const metas = getMetas();
    const total = metas.length;
    const concluidas = metas.filter(m => m.feito).length;
    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

    // Atualiza textos e barra
    document.getElementById('contadorTexto').textContent = `${percentual}%`;
    document.getElementById('barraProgresso').style.width = `${percentual}%`;

    // Alerta de conclusão
    if (total > 0 && concluidas === total) {
        if (!window.alertaMostrado) {
            window.alertaMostrado = true;
            alert('🏆 PARABÉNS! 🏆\n\nVocê completou todas as suas metas!\nContinue assim, você é incrível!');
            setTimeout(() => window.alertaMostrado = false, 2000);
        }
    } else {
        window.alertaMostrado = false;
    }
}

// ============================================================
// 7. RESETAR METAS
// ============================================================

/**
 * Desmarca todas as metas como não concluídas
 * - Pede confirmação antes de resetar
 */
function resetarMetas() {
    const metas = getMetas();
    if (metas.length === 0) {
        alert('📭 Não há metas para resetar!');
        return;
    }

    if (confirm('⚠️ Tem certeza que deseja desmarcar todas as metas?')) {
        metas.forEach(m => m.feito = false);
        salvarMetas(metas);
        mostrarMetas();
        atualizarContador();
        atualizarDashboard();
        alert('✅ Todas as metas foram resetadas!');
    }
}

// ============================================================
// 8. DASHBOARD - ESTATÍSTICAS
// ============================================================

/**
 * Atualiza o dashboard com estatísticas completas
 * - Total, concluídas, pendentes, percentual
 * - Mensagem personalizada de resumo
 */
function atualizarDashboard() {
    const metas = getMetas();
    const total = metas.length;
    const concluidas = metas.filter(m => m.feito).length;
    const pendentes = total - concluidas;
    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100);

    // Atualiza cards
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statConcluidas').textContent = concluidas;
    document.getElementById('statPercentual').textContent = percentual + '%';
    document.getElementById('statPendentes').textContent = pendentes;

    // Mensagem personalizada
    const resumo = document.getElementById('resumoTexto');
    if (total === 0) {
        resumo.textContent = '📭 Nenhuma meta cadastrada ainda. Comece adicionando sua primeira meta!';
    } else if (percentual === 100) {
        resumo.textContent = `🎉 Uau! Você completou TODAS as ${total} metas! Incrível! Continue assim!`;
    } else if (percentual >= 50) {
        resumo.textContent = `🚀 Bom trabalho! Você já completou ${concluidas} de ${total} metas (${percentual}%). Continue firme!`;
    } else if (percentual > 0) {
        resumo.textContent = `💪 Você já completou ${concluidas} de ${total} metas (${percentual}%). Foco que dá certo!`;
    } else {
        resumo.textContent = `📋 Você tem ${total} metas cadastradas. Comece a marcar as concluídas!`;
    }
}

// ============================================================
// 9. TEMA (DARK / LIGHT)
// ============================================================

let temaAtual = 'dark';

/**
 * Alterna entre tema escuro e claro
 * - Muda as variáveis CSS
 * - Atualiza o ícone do botão
 */
function toggleTheme() {
    temaAtual = temaAtual === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', temaAtual);
    document.querySelector('.btn-theme i').className =
        temaAtual === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// ============================================================
// 10. INICIALIZAÇÃO
// ============================================================

/**
 * Carrega as metas do usuário e atualiza a tela
 */
function carregarMetas() {
    mostrarMetas();
    atualizarContador();
    atualizarDashboard();
}

// ============================================================
// 11. EVENTOS
// ============================================================

// Botão Adicionar
document.getElementById('btnAdicionar').onclick = adicionarMeta;

// Botão Reset
document.getElementById('reset').onclick = resetarMetas;

// Tecla Enter no campo de texto
document.getElementById('novaMetaInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') adicionarMeta();
});

// Tecla Enter nos campos de login
document.getElementById('loginUser').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fazerLogin();
});
document.getElementById('loginPass').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fazerLogin();
});

// ============================================================
// 12. CRIAÇÃO DO USUÁRIO ADMIN PADRÃO
// ============================================================

const usuarios = JSON.parse(localStorage.getItem('metaflow_usuarios') || '{}');
if (!usuarios.admin) {
    usuarios.admin = {
        senha: '123456',
        metas: [
            { id: 1, texto: '💧 Beber 2L de água', categoria: '💪 Saúde', prioridade: 'media', feito: false },
            { id: 2, texto: '📚 Estudar 30 minutos', categoria: '📚 Estudo', prioridade: 'alta', feito: false },
            { id: 3, texto: '🏃 Fazer exercício', categoria: '💪 Saúde', prioridade: 'media', feito: false }
        ]
    };
    localStorage.setItem('metaflow_usuarios', JSON.stringify(usuarios));
}

// ============================================================
// 13. LOG NO CONSOLE (PARA DESENVOLVEDORES)
// ============================================================

console.log('🎯 MetaFlow PRO v4.0 carregado com sucesso!');
console.log('👤 Login padrão: admin | Senha: 123456');
console.log('💡 Dica: Os dados são salvos no localStorage do navegador.');

// ============================================================
// FIM DO JAVASCRIPT
// ============================================================
