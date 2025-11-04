// Aguarda o carregamento completo do DOM
document.addEventListener("DOMContentLoaded", function() {

    // --- Lógica para a Página de Detalhes da Mala ---
    const bookingForm = document.getElementById("booking-form");

    if (bookingForm) {
        const dataRetiradaInput = document.getElementById("data-retirada");
        const dataDevolucaoInput = document.getElementById("data-devolucao");
        const pricePerDayElement = document.querySelector(".price-per-day");
        const totalPriceDisplay = document.getElementById("total-price-display");

        // Pega o preço por dia (armazenado no atributo 'data-price-per-day')
        const pricePerDay = parseFloat(pricePerDayElement.getAttribute("data-price-per-day"));

        // Função para calcular o total
        function calculateTotal() {
            const dataRetirada = new Date(dataRetiradaInput.value);
            const dataDevolucao = new Date(dataDevolucaoInput.value);

            // Validação simples de datas
            if (dataRetiradaInput.value && dataDevolucaoInput.value && dataDevolucao > dataRetirada) {
                // Calcula a diferença em milissegundos
                const diffTime = Math.abs(dataDevolucao - dataRetirada);
                // Converte para dias (1 dia = 24 * 60 * 60 * 1000 milissegundos)
                // Adiciona +1 para incluir o dia da retirada (diária)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

                const total = diffDays * pricePerDay;

                totalPriceDisplay.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
            } else {
                totalPriceDisplay.textContent = "R$ 0,00";
            }
        }

        // Adiciona "escutadores" para recalcular quando as datas mudarem
        dataRetiradaInput.addEventListener("change", calculateTotal);
        dataDevolucaoInput.addEventListener("change", calculateTotal);

        // Lida com o envio do formulário (simulação)
        bookingForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Impede o envio real do formulário
            
            if (totalPriceDisplay.textContent === "R$ 0,00") {
                alert("Por favor, selecione datas válidas.");
            } else {
                // Em um site real, isso redirecionaria para o carrinho/checkout
                alert(`Reserva adicionada! Total: ${totalPriceDisplay.textContent}\n(Isso redirecionaria para o carrinho)`);
                
                // Aqui você enviaria os dados para o back-end
            }
        });
    }

    // --- Lógica para o Catálogo (simulação de filtro) ---
    const filterForm = document.getElementById("filter-form");
    if (filterForm) {
        filterForm.addEventListener("submit", function(event) {
            event.preventDefault();
            alert("Em um site real, os filtros seriam aplicados aqui, recarregando os produtos (sem recarregar a página).");
        });
    }

});