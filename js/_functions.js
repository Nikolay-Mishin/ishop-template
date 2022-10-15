/* Comments */

function setEditorOnChange(editor, btn, callback = null) {
	editorOnChange(editor, callback !== null ? callback : function (value) {
		content = value;
		if (content) {
			btn.attr('disabled', false);
		}
		else {
			btn.attr('disabled', true);
		}
	});
	btn.attr('disabled', true);
}

function addComment(e, comment_form, content, comments, count) {
	// блокируем отправку формы, если тип отправки Ajax
	e.preventDefault();
	console.log({ addComment: content, this: this });
	// если список данных не пуст обрабатываем его, иначе перезапрашиваем текущую страницу
	if (content) {
		var product_id = comment_form.find('[name=product_id]').val(),
			user_id = comment_form.find('[name=user_id]').val(),
			parent_id = comment_form.find('[name=parent_id]').val(),
			args = { target: comments, count: count };
		data = { content: content, product_id: product_id, user_id: user_id, parent_id: parent_id };
		// ajax-запрос
		ajax(comment_form.attr('action'), getComments, data, args, 'Ошибка!', showPreloader(comments), 'POST');
	}
	else {
		window.location = location.pathname; // /category/men
	}
}

function getComments(comments, args) {
	comments = JSON.parse(comments);
	console.log({ comments: comments });
	var { target, count } = args;
	hidePreloader(function () {
		target.html(comments.html).fadeIn();
		count.text(comments.count);
	});
}

function getRate(res, args, rating) {
	res = JSON.parse(res);
	var rate = res.rate;
	if (rate != undefined) {
		var add_class = rate > 0 ? 'plus' : (rate < 0 ? 'minus' : ''),
			remove_class = rate > 0 ? 'minus' : (rate < 0 ? 'plus' : 'plus minus');
		rating.text(rate > 0 ? `+${rate}` : rate);
		rating.removeClass(remove_class).addClass(add_class);
	}
}

function getReply(reply, args, comment) {
	reply = JSON.parse(reply);
	var editor = reply.editor,
		comments = args.comments,
		reply_editor = getReplyEditor(comments, args.reply_editor);

	getReplyParent(reply_editor).remove();
	comment.append(editor);
	editor = comment.find('.editor');
	editorInstance(editor);

	console.log({ editor: editor, comment: comment });

	var comment_reply = getReplyParent(editor),
		btn = comment_reply.find('button');

	setEditorOnChange(editor, btn);

	// блокируем отправку формы, если тип отправки Ajax
	if (comment_reply.data('ajax')) {
		comment_reply.on('submit', e => addComment(e, comment_reply, content, comments, count));
	}
}

function getReplyParent(reply, closest = 'form') {
	return reply.parent().closest(closest);
}

function getReplyEditor(comments, find) {
	return comments.find(find);
}

/* // Comments */

/* Filters */

// плавно скрываем прелоадер (fadeOut = 'slow') с задержкой (delay = 500) и отображаем товары (call-back функция)
function showFilter(res, data) {
	//$('.preloader').delay(500).fadeOut('slow', function(){
	hidePreloader(function() {
		$('.product-one').html(res).fadeIn();
		// удаляем из строки поиска выражение 'filter=1,' (начиная со слова filter, поле могут идти любые символы (=1,) до знака &)
		// ?filter=1,&page=2 => ?page=2
		var url = location.search.replace(/filter(.+?)(&|$)/g, ''); //$2
		// если в объекте location есть search (get-параметр), добавляем & и прибавляем параметр filter к существующим get-параметрам
		// иначе добавляем ? - формируем get-параметры
		// /category/men + ?page=2 + &filter=1, или /category/men + ?filter=1,
		var newURL = location.pathname + url + (location.search ? "&" : "?") + "filter=" + data;
		newURL = newURL.replace('&&', '&'); // заменяем дублирующие & на 1 знак &
		newURL = newURL.replace('?&', '?'); // символ '?&' заменяем на ?
		// pushState - отправляет новый url (обновляет состояние url, заменяя то, что в нем хранится на newURL)
		history.pushState({}, '', newURL); // объект истории браузера (позволяет запоминать состояние строки url)
	});
}

/* // Filters */

/* Cart */

// отображает корзину
function showCart(cart) {
	changeCart(cart); // изменяем содержимое корзины
	$('#cart').modal(); // показываем модальное окно
}

// изменяет содержимое корзины
function changeCart(cart) {
	$('#cart .modal-body').html(cart); // в тело модального окна записываем полученный из запроса ответ (контент)
	// если есть элемент с классом 'cart-sum' (корзина не пуста), меняем значение общей сумму у иконки с корзиной
	if ($('.cart-sum').text()) {
		$('.simpleCart_total').html($('#cart .cart-sum').text()); // в элемент с классом 'simpleCart_total' добавляем сумму заказа
	}
	else {
		$('.simpleCart_total').text('Empty Cart');
	}
	// если корзина пуста - скрываем в футере кнопки для взаимодействия с содержимым (оформить заказ и очистить корзину)
	// trim - обрезаем пробелы по бокам
	if ($.trim(cart) == '<h3>Корзина пуста</h3>') {
		// скрываем ссылку для оформления заказа и кнопку для очистки корзины
		$('#cart-order, #cart-clean').css('display', 'none');
	}
	else {
		// отображаем ссылку для оформления заказа и кнопку для очистки корзины
		$('#cart-order, #cart-clean').css('display', 'inline-block');
	}
}

// отображает корзину при клике по ней
function getCart() {
	ajax('/cart/show', showCart); // ajax-запрос
	/* $.ajax({
		url: '/cart/show',
		type: 'GET',
		success: function(res){
			showCart(res);
		},
		error: function(){
			alert('Ошибка! Попробуйте позже');
		}
	}); */
}

// очищает корзину
function clearCart() {
	ajax('/cart/clear', changeCart); // ajax-запрос
	/* $.ajax({
		url: '/cart/clear',
		type: 'GET',
		success: function(res){
			showCart(res);
		},
		error: function(){
			alert('Ошибка! Попробуйте позже');
		}
	}); */
}

// пересчитывает корзину при изменении количества товаров
function cartRecalc() {
	var productsChange = {}; // количество товара (если нет = 1)
	cartRecalc.productsChange.forEach(function(item) {
		productsChange[$(item).data('id')] = $(item).val() - $(item).data('qty');
	});
	ajax('/cart/recalc', changeCart, {productsChange: productsChange}); // ajax-запрос
}

/* // Cart */
