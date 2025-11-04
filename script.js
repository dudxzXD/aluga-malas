// Aguarda o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", function() {

    // --- FUNÇÕES GLOBAIS (Executam em todas as páginas) ---

    /**
     * Atualiza o cabeçalho para mostrar "Login/Cadastro" ou "Bem-vindo/Sair"
     */
    function updateHeaderNav() {
        const userActionsContainer = document.getElementById("user-actions");
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

        if (userActionsContainer) {
            if (loggedInUser) {
                // Usuário está logado
                userActionsContainer.innerHTML = `
                    <span class="welcome-message">Olá, ${loggedInUser.nome}!</span>
                    <a href="#" id="logout-btn" class="btn btn-secondary">Sair</a>
                `;
            } else {
                // Usuário está deslogado
                userActionsContainer.innerHTML = `
                    <a href="login.html" class="btn btn-secondary">Login</a>
                    <a href="cadastro.html" class="btn">Cadastre-se</a>
                `;
            }
        }
        
        // Adiciona o listener de evento ao botão de logout (se ele existir)
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function(event) {
                event.preventDefault();
                localStorage.removeItem("loggedInUser");
                // Redireciona para o index para garantir que o estado seja atualizado
                window.location.href = "index.html";
            });
        }
    }

    /**
     * Atualiza o contador de itens no ícone do carrinho
     */
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const cartCountElement = document.getElementById("cart-count");
        
        if (cartCountElement) {
            if (cart.length > 0) {
                cartCountElement.textContent = cart.length;
            } else {
                cartCountElement.textContent = ""; // Oculta se for 0
            }
        }
    }

    // Executa as funções globais em todas as páginas
    updateHeaderNav();
    updateCartCount();

    // --- LÓGICA DA PÁGINA DE CADASTRO ---
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const nome = document.getElementById("nome").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;
            const messageEl = document.getElementById("form-message");

            if (password !== confirmPassword) {
                showMessage("As senhas não coincidem.", "error", messageEl);
                return;
            }

            // Pega usuários existentes ou cria um array vazio
            let users = JSON.parse(localStorage.getItem("users")) || [];

            // Verifica se o usuário já existe
            const userExists = users.some(user => user.email === email);
            if (userExists) {
                showMessage("Este e-mail já está cadastrado.", "error", messageEl);
                return;
            }

            // Adiciona o novo usuário
            users.push({ nome, email, password });
            localStorage.setItem("users", JSON.stringify(users));

            showMessage("Cadastro realizado com sucesso! Redirecionando para o login...", "success", messageEl);
            
            // Redireciona para o login após 2 segundos
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        });
    }

    // --- LÓGICA DA PÁGINA DE LOGIN ---
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const messageEl = document.getElementById("form-message");
            
            const users = JSON.parse(localStorage.getItem("users")) || [];

            // Encontra o usuário
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Sucesso no login
                // Salva apenas nome e email, nunca a senha
                localStorage.setItem("loggedInUser", JSON.stringify({ nome: user.nome, email: user.email }));
                showMessage("Login realizado com sucesso! Redirecionando...", "success", messageEl);
                
                // Redireciona para a home após 1 segundo
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
                
            } else {
                // Falha no login
                showMessage("E-mail ou senha inválidos.", "error", messageEl);
            }
        });
    }

    // --- LÓGICA DA PÁGINA DE DETALHES DA MALA (RESERVA) ---
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
        const dataRetiradaInput = document.getElementById("data-retirada");
        const dataDevolucaoInput = document.getElementById("data-devolucao");
        const pricePerDayElement = document.querySelector(".price-per-day");
        const totalPriceDisplay = document.getElementById("total-price-display");
        const pricePerDay = parseFloat(pricePerDayElement.getAttribute("data-price-per-day"));

        // Função para calcular o total
        function calculateTotal() {
            const dataRetirada = new Date(dataRetiradaInput.value);
            const dataDevolucao = new Date(dataDevolucaoInput.value);

            if (dataRetiradaInput.value && dataDevolucaoInput.value && dataDevolucao > dataRetirada) {
                const diffTime = Math.abs(dataDevolucao - dataRetirada);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
                const total = diffDays * pricePerDay;
                
                totalPriceDisplay.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
                totalPriceDisplay.dataset.total = total; // Salva o valor numérico
            } else {
                totalPriceDisplay.textContent = "R$ 0,00";
                totalPriceDisplay.dataset.total = "0";
            }
        }

        dataRetiradaInput.addEventListener("change", calculateTotal);
        dataDevolucaoInput.addEventListener("change", calculateTotal);

        // --- AQUI ESTÁ A MUDANÇA PRINCIPAL: ADICIONAR AO CARRINHO ---
        bookingForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            // 1. Verificar se o usuário está logado
            const loggedInUser = localStorage.getItem("loggedInUser");
            if (!loggedInUser) {
                alert("Você precisa estar logado para alugar uma mala.");
                window.location.href = "login.html";
                return;
            }

            // 2. Validar as datas e o preço
            const total = parseFloat(totalPriceDisplay.dataset.total);
            if (total <= 0) {
                alert("Por favor, selecione datas válidas.");
                return;
            }
            
            // 3. Montar o objeto do item
            const item = {
                id: `mala_${Date.now()}`, // ID único
                nome: document.querySelector(".product-info h1").textContent,
                img: document.querySelector(".product-gallery .main-image").src,
                dataRetirada: dataRetiradaInput.value,
                dataDevolucao: dataDevolucaoInput.value,
                precoTotal: total
            };

            // 4. Adicionar ao carrinho (LocalStorage)
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            cart.push(item);
            localStorage.setItem("cart", JSON.stringify(cart));
            
            // 5. Atualizar o contador do carrinho e redirecionar
            updateCartCount();
            alert("Mala adicionada ao carrinho!");
            window.location.href = "carrinho.html";
        });
    }

    // --- LÓGICA DA PÁGINA DO CARRINHO ---
    const cartContainer = document.getElementById("cart-items-container");
    if (cartContainer) {
        displayCartItems();
    }

    function displayCartItems() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const cartContainer = document.getElementById("cart-items-container");
        const subtotalEl = document.getElementById("cart-subtotal");
        const totalEl = document.getElementById("cart-total");
        const taxa = 10.00; // Taxa fixa de higienização
        
        cartContainer.innerHTML = ""; // Limpa o carrinho antes de renderizar
        
        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
            subtotalEl.textContent = "R$ 0,00";
            totalEl.textContent = "R$ 0,00"; // Se não há itens, não há taxa
            return;
        }

        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += item.precoTotal;
            
            // Formata as datas para exibição (DD/MM/YYYY)
            const dataRetiradaFormatada = new Date(item.dataRetirada).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const dataDevolucaoFormatada = new Date(item.dataDevolucao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            const itemHtml = `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.img}" alt="${item.nome}">
                    <div class="cart-item-details">
                        <h3>${item.nome}</h3>
                        <p>Datas: ${dataRetiradaFormatada} a ${dataDevolucaoFormatada}</p>
                        <p class="price">R$ ${item.precoTotal.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <button class="btn-remove">Remover</button>
                </div>
            `;
            cartContainer.innerHTML += itemHtml;
        });

        const total = subtotal + taxa;
        subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        // Adiciona listeners aos botões de remoção
        addRemoveListeners();
    }

    function addRemoveListeners() {
        const removeButtons = document.querySelectorAll(".btn-remove");
        removeButtons.forEach(button => {
            button.addEventListener("click", function() {
                // Pega o ID do item do elemento pai
                const itemId = this.closest(".cart-item").dataset.id;
                removeFromCart(itemId);
            });
        });
    }

    function removeFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        
        // Filtra o array, mantendo todos os itens EXCETO o item com o ID correspondente
        cart = cart.filter(item => item.id !== itemId);
        
        localStorage.setItem("cart", JSON.stringify(cart));
        
        // Re-renderiza o carrinho e atualiza o contador
        displayCartItems();
        updateCartCount();
    }


    // --- Lógica para o Catálogo (simulação de filtro) ---
    const filterForm = document.getElementById("filter-form");
    if (filterForm) {
        filterForm.addEventListener("submit", function(event) {
            event.preventDefault();
            alert("Em um site real, os filtros seriam aplicados aqui.");
        });
    }
    
    // --- Função utilitária para mostrar mensagens (login/cadastro) ---
    function showMessage(message, type, element) {
        element.textContent = message;
        element.className = type; // "success" ou "error"
        element.style.display = "block";
    }

});