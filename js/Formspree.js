$(document).ready(function() {
    $('#contactForm').submit(function(e) {
        e.preventDefault(); // Evita que la página se recargue o redirija

        var form = $(this);
        var btn = $('#submitBtn');
        var status = $('#form-status');

        // 1. Efecto visual de carga
        btn.prop('disabled', true).text('Enviando...');
        status.text('Procesando tu mensaje...').css('color', '#666');

        // 2. Envío por AJAX
        $.ajax({
            url: form.attr('action'), // Toma la URL de Formspree que pusiste en el HTML
            method: 'POST',
            data: form.serialize(), // Empaqueta todos los campos con sus "name"
            dataType: 'json',
            success: function() {
                // 3. Respuesta de éxito
                status.text('¡Mensaje enviado con éxito! Me pondré en contacto pronto.').css('color', 'green');
                form[0].reset(); // Limpia los campos del formulario
                btn.prop('disabled', false).text('Enviar mensaje');
            },
            error: function() {
                // 4. Respuesta de error
                status.text('Lo siento, hubo un error. Inténtalo de nuevo.').css('color', 'red');
                btn.prop('disabled', false).text('Enviar mensaje');
            }
        });
    });
});