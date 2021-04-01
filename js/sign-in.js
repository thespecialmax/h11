var SignInFunctions = function()
{
	var exports = {};
	var login_alert_timeout;
	
	function init(){
		
		$('#signInModal .signin-btns-container .btn-show-tab').click(function(){
			if($(this).hasClass('btn-tab-active')) return false;
			$('#signInModal .signin-btns-container .btn-tab-active').removeClass('btn-tab-active');
			$(this).addClass('btn-tab-active');
			$('#signInTabs a[href="'+$(this).attr('href')+'-popup"]').tab('show');
			return false;
		});
		
		
		$('#signInModal a.open_tab').click(function(){
			$('#signInModal .signin-btns-container .btn-tab-active').removeClass('btn-tab-active');
			$('#signInTabs a[href="'+$(this).attr('href')+'-popup"]').tab('show');
			$('#signInModal .signin-btns-container .btn-tab-active').removeClass('btn-tab-active');
			$('#signInModal .signin-btns-container '+$(this).attr('href')+'-action').addClass('btn-tab-active');
			return false;
		});
		
		$('#signInModal form.action_submit .submit-action').click(function(){
			$(this).parents('form').submit();
			return false;
		});
		
		$('#signInModal form.no_submit').find(':input:not(textarea)').keydown(function(e){
			if (e.keyCode == 13) {
				e.preventDefault();
			}
			//if($(this).parents('.form-group').hasClass('has-error') && $(this).val()) $(this).parents('.form-group').removeClass('has-error');
		});
		
		$('#signInModal .show_password').click(function(){
			var input = $(this).parents('.form-row').find('input.form-control');
			if(input.attr('type') == 'text'){
				input.attr('type','password');
				$(this).find('.far').removeClass('fa-eye-slash').addClass('fa-eye');
			}else{
				input.attr('type','text');
				$(this).find('.far').removeClass('fa-eye').addClass('fa-eye-slash');
			}
			return false;
		});
		
		$('#modal_ajax_login_form').submit(function(e){
			e.preventDefault();
			adrform = $(this);
			var sc = adrform.find('.submit-container');
			sc.find('.submit-action').hide();
			sc.find('.signin-loading').show();
			
			var error = false;
			var input_counter = 0;
			adrform.find('input.required').each(function(){
				$(this).removeClass('is-invalid');
				if(!$(this).val()){
					error = true;
					$(this).addClass('is-invalid');
					$(this).blur(function() {
						if($(this).val()) $(this).removeClass('is-invalid');
					});
					if(input_counter == 0) $(this).focus();
					input_counter++;
				}
			});
			if(error){
				sc.find('.signin-loading').hide();
				sc.find('.submit-action').show();
				return false;
			}
			
			$('#signin-tab-popup .alert').remove();
			if(login_alert_timeout) clearTimeout(login_alert_timeout);
			$.ajax({
				type: "POST",
				url: adrform.attr('action'), 					
				data: adrform.serializeArray(), 
				timeout: config.ajax_timeout,
				dataType: 'json',
				error: function(jqXHR, textStatus, errorThrown) {
					if(jqXHR.status == 403){
						var myresp = JSON.parse(jqXHR.responseText);
						//$('#modal_ajax_login_form input[name="login_token"]').val( myresp.token );
						$('#signInModal input[name="login_token"]').val( myresp.token );
						adrform.before('<div class="alert alert-danger" role="alert">'+myresp.message+'</div>');
						grecaptcha.reset();
						login_alert_timeout = setTimeout(function(){
							$('#signin-tab-popup .alert').slideUp(function(){
								$('#signin-tab-popup .alert').remove();
							})
						}, 15000);
					}else{
						if(textStatus == 'timeout'){
							swal({title: config.timeout_title,text: config.timeout_text,type: 'warning',timer: 3000});
						}else{
							swal({title: config.ajax_error_title,text: config.ajax_error_text,type: 'warning',timer: 3000});
						}
					}
					sc.find('.signin-loading').hide();
					sc.find('.submit-action').show();
				},
			}).success(function (response) {
				//$('#modal_ajax_login_form input[name="login_token"]').val( response.token );
				$('#signInModal input[name="login_token"]').val( response.token );
				if(response.status == 1){
					if(response.redirect_to){
						window.location.href = response.redirect_to;
					}else{
						location.reload(true);
					}
				}else{
					grecaptcha.reset();
					$('#modal_ajax_login_form').before('<div class="alert alert-danger" role="alert">'+response.message+'</div>');
					login_alert_timeout = setTimeout(function(){
						$('#signin-tab-popup .alert').slideUp(function(){
							$('#signin-tab-popup .alert').remove();
						})
					}, 15000);
					sc.find('.signin-loading').hide();
					sc.find('.submit-action').show();
				}
			});
			return false;
		});
		
		$('#ajax_password_reminder_form').submit(function(e){
			e.preventDefault();
			adrform = $(this);
			var sc = adrform.find('.submit-container');
			sc.find('.submit-action').hide();
			sc.find('.signin-loading').show();
			
			var error = false;
			var input_counter = 0;
			adrform.find('input.required').each(function(){
				$(this).removeClass('is-invalid');
				if(!$(this).val()){
					error = true;
					$(this).addClass('is-invalid');
					$(this).blur(function() {
						if($(this).val()) $(this).removeClass('is-invalid');
					});
					if(input_counter == 0) $(this).focus();
					input_counter++;
				}
			});
			if(error){
				sc.find('.signin-loading').hide();
				sc.find('.submit-action').show();
				return false;
			}
			
			$('#forgotpass-tab-popup .alert').remove();
			if(login_alert_timeout) clearTimeout(login_alert_timeout);
			$.ajax({
				type: "POST",
				url: adrform.attr('action'), 					
				data: adrform.serializeArray(), 
				timeout: config.ajax_timeout,
				dataType: 'json',
				error: function(jqXHR, textStatus, errorThrown) {
					if(textStatus == 'timeout'){
						swal({title: config.timeout_title,text: config.timeout_text,type: 'warning',timer: 3000});
					}else{
						swal({title: config.ajax_error_title,text: config.ajax_error_text,type: 'warning',timer: 3000});
					}
					sc.find('.signin-loading').hide();
					sc.find('.submit-action').show();
				},
			}).success(function (response) {
				$('input[name="login_token"]').val( response.token );
				if(response.status == 1){
					adrform.hide();
					$('#forgotpass-tab-popup .password_reminder_send').removeClass('d-none');
				}else{
					adrform.before('<div class="alert alert-danger" role="alert">'+response.message+'</div>');
					login_alert_timeout = setTimeout(function(){
						$('#forgotpass-tab-popup .alert').slideUp(function(){
							$('#forgotpass-tab-popup .alert').remove();
						})
					}, 15000);
				}
				sc.find('.signin-loading').hide();
				sc.find('.submit-action').show();
			});
			return false;
		});
		
		
		$('#ajax_register_form').submit(function(e){
			e.preventDefault();
			adrform = $(this);
			var sc = adrform.find('.submit-container');
			sc.find('.submit-action').hide();
			sc.find('.signin-loading').show();
			
			var error = false;
			var input_counter = 0;
			adrform.find('input.required').each(function(){
				$(this).removeClass('is-invalid');
				if(!$(this).val()){
					error = true;
					$(this).addClass('is-invalid');
					$(this).blur(function() {
						if($(this).val()) $(this).removeClass('is-invalid');
					});
					if(input_counter == 0) $(this).focus();
					input_counter++;
				}
			});
			if(error){
				sc.find('.signin-loading').hide();
				sc.find('.submit-action').show();
				return false;
			}
			
			$('#register-tab-popup .alert').remove();
			if(login_alert_timeout) clearTimeout(login_alert_timeout);
			$.ajax({
				type: "POST",
				url: adrform.attr('action'), 					
				data: adrform.serializeArray(), 
				timeout: config.ajax_timeout,
				dataType: 'json',
				error: function(jqXHR, textStatus, errorThrown) {
					if(textStatus == 'timeout'){
						swal({title: config.timeout_title,text: config.timeout_text,type: 'warning',timer: 3000});
					}else{
						swal({title: config.ajax_error_title,text: config.ajax_error_text,type: 'warning',timer: 3000});
					}
					sc.find('.signin-loading').hide();
					sc.find('.submit-action').show();
				},
			}).success(function (response) {
				if(response.status == 1){
					if(response.redirect_to){
						window.location.href = response.redirect_to;
					}else{
						location.reload(true);
					}
				}else{
					adrform.before('<div class="alert alert-danger" role="alert">'+response.message+'</div>');
					$.each(response.inputs,function(i,input_name){
						adrform.find('input[name="'+input_name+'"]').addClass('is-invalid');
					});
					login_alert_timeout = setTimeout(function(){
						$('#register-tab-popup .alert').slideUp(function(){
							$('#register-tab-popup .alert').remove();
						})
					}, 15000);
				}
				sc.find('.signin-loading').hide();
				sc.find('.submit-action').show();
			});
		});
		
		$('#signInModal').on('hidden.bs.modal', function (event) {
			$('#signInModal .signin-btns-container .btn-tab-active').removeClass('btn-tab-active');
			$('#signInModal .signin-btns-container a[href="#signin-tab"]').addClass('btn-tab-active');
			$('#signInTabs a[href="#signin-tab-popup"]').tab('show');
			$('#signInModal #ajax_password_reminder_form').show();
			$('#signInModal #forgotpass-tab-popup .password_reminder_send').addClass('d-none');
		});
		
	}
	
	exports.init = init;
	return exports;
}

var signInFunctions = new SignInFunctions();

$(document).ready(function() {
	
	signInFunctions.init();
	
});