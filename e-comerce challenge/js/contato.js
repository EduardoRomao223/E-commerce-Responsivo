// Validação e envio do formulário de contato
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const telefoneInput = document.getElementById('telefone');
    const mensagemTextarea = document.getElementById('mensagem');

    // Máscara para telefone
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        }
    });

    // Contador de caracteres para mensagem
    mensagemTextarea.addEventListener('input', function(e) {
        const maxLength = 500;
        const currentLength = e.target.value.length;
        const counter = e.target.parentElement.querySelector('.form-text');
        
        if (counter) {
            counter.textContent = `${currentLength}/${maxLength} caracteres`;
            
            if (currentLength > maxLength) {
                counter.classList.add('text-danger');
            } else {
                counter.classList.remove('text-danger');
            }
        }
    });

    // Envio do formulário
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!contactForm.checkValidity()) {
            e.stopPropagation();
            contactForm.classList.add('was-validated');
            return;
        }

        // Simulação de envio (em um caso real, faria uma requisição AJAX)
        const formData = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value,
            assunto: document.getElementById('assunto').value,
            mensagem: document.getElementById('mensagem').value,
            newsletter: document.getElementById('newsletter').checked
        };

        // Mostrar loading
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Enviando...';
        submitBtn.disabled = true;

        // Simular delay de envio
        setTimeout(() => {
            // Aqui em um caso real faria a requisição AJAX
            console.log('Dados do formulário:', formData);
            
            // Feedback de sucesso
            showAlert('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            
            // Resetar formulário
            contactForm.reset();
            contactForm.classList.remove('was-validated');
            
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
        }, 2000);
    });

    // Função para mostrar alertas
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Reset do formulário
    contactForm.addEventListener('reset', function() {
        contactForm.classList.remove('was-validated');
        const counter = mensagemTextarea.parentElement.querySelector('.form-text');
        if (counter) {
            counter.textContent = 'Máximo de 500 caracteres';
            counter.classList.remove('text-danger');
        }
    });
});