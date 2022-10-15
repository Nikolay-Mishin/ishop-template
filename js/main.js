(function() {
	console.log(Ishop);
})();

/* Comments */

var comments = $('#comments');

if (notEmpty(comments)) {
	var comment_add = comments.find('#comment_add'),
		editor = comment_add.find('.editor'),
		btn = comment_add.find('button'),
		content = '',
		count = comments.find('#comments-count'),
		comments = comments.find('#comments-list'),
		vote = '.vote',
		reply = '.reply',
		reply_editor = '#reply_editor';

	setEditorOnChange(editor, btn);

	console.log(content);

	// блокируем отправку формы, если тип отправки Ajax
	if (comment_add.data('ajax')) {
		comment_add.on('submit', e => addComment(e, comment_add, content, comments, count));
	}

	delegate(vote, 'click touchstart', function(e, vote) {
		var $this = $(this),
			url = $this.data('url'),
			rating = $this.siblings('.rating');
		//$(".lBlock").siblings(".cont"); // найдет элементы класса cont, которые имеют общих родителей, с элементами класса lBlock
		ajax(url, getRate, rating); // ajax-запрос
	}, comments);

	delegate(reply, 'click touchstart', function(e, reply) {
		e.preventDefault();
		var $this = $(this),
			url = $this.attr('href'),
			comment = $this.closest('.comment'),
			comment_footer = comment.children('.media-body').children('.footer-comment'),
			args = { comments: comments, reply_editor: reply_editor };
		ajax(url, getReply, comment_footer, args); // ajax-запрос
		console.log({ comment: comment, comment_footer: comment_footer, args: args });
	}, comments);
}

/* // Comments */

/* Filters */

// делигируем событие изменения от body инпутам в сайдбаре (списке фильтров)
$('body').on('change', '.w_sidebar input', function() {
	var checked = $('.w_sidebar input:checked'), // список выбранных фильтров
		data = '';
	// проходим в фикле по выбранным фильтрам и формируем строку со списком id фильтров, разделенных ','
	checked.each(function () {
		data += this.value + ',';
	});
	// если список фильтров не пуст обрабатываем его, иначе перезапрашиваем текущую страницу
	if (data) {
		ajax(location.href, showFilter, { filter: data }, data, 'Ошибка!', showPreloader); // ajax-запрос
		/* $.ajax({
			url: location.href, // url для отправки на сервер (абсолютный адрес текущей страницы - http://ishop/category/men)
			data: {filter: data}, // данные для отправки на сервер
			type: 'GET',
			// функция, вызываемая перед отправкой запроса
			beforeSend: showPreloader(),
			success: function(res){
				showFilter(res, data);
			},
			error: function () {
				alert('Ошибка!');
			}
		}); */
	}
	else {
		window.location = location.pathname; // /category/men
	}
});

/* // Filters */

/* Search */

// переменная для хранения объекта движка Bloodhound плагина typeahead
// используем для получения данных поискового запроса
var products = new Bloodhound({
	datumTokenizer: Bloodhound.tokenizers.whitespace,
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	remote: {
		wildcard: '%QUERY', // маркер, который будет заменен поисковым запросом (подставляется в url)
		// на экшен 'typeahead' отправляется GET-параметр 'query'
		url: path + '/search/typeahead?query=%QUERY' // адрес для отправки запроса (вместо %QUERY подставляется маркер wildcard)
	}
});

products.initialize(); // инициализируем объект для поискового запроса

$("#typeahead").typeahead(
	{
		// hint: false,
		highlight: true // подсветка вводимого текста
	},
	{
		name: 'products',
		display: 'title', // то, что хотим показывать
		limit: 10, // на 1 меньше, чем будет приходить (LIMIT 11)
		source: products // источник данных
});

// при выборе результата из выпадающего списка срабатывает событие (typeahead:select)
$('#typeahead').bind('typeahead:select', function(ev, suggestion) {
	// console.log(suggestion);
	// на экшен 'index' отправляется GET-параметр 's' со значением наименования продукта
	window.location = path + '/search/?s=' + encodeURIComponent(suggestion.title); // перенаправление на страницу поиского запроса
});

/* // Search */

/* Cart */

// событие при клике по сслыке для добавления в корзину
// Урок - делегирование событий в JS (для элементов которых изначально не было на странице - добавлены динамически)
// берем элемент 'body' (он есть всегда) и от него делегируем событие 'click' для элементов с классом 'add-to-cart-link'
$('body').on('click', '.add-to-cart-link', function(e) {
	e.preventDefault(); // отменяем действие по умолчанию (запретить переход по ссылке и тд) - также можно return false;
	var id = $(this).data('id'), // id с номером товара
		qty = $('.quantity input').val() ? $('.quantity input').val() : 1, // количество товара (если нет = 1)
		mod = $('.available select').val(); // id модификатора товара

	ajax('/cart/add', changeCart, {id: id, qty: qty, mod: mod}); // ajax-запрос
	/* $.ajax({
		url: '/cart/add', // адрес для отправки запроса на серевер ('/' вначале - путь будет идти от корня или path + '/cart/add')
		data: {id: id, qty: qty, mod: mod}, // объект с данными для отправки на серевер
		type: 'GET', // метод отправки запроса
		success: function(res){
			// res - ответ от сервера
			showCart(res); // отображаем корзину
		},
		error: function(){
			alert('Ошибка! Попробуйте позже');
		}
	}); */
});

// событие при клике на ссылку для удаления товара из корзины
// делегируем событие клика от тела модального окна корзины элементу с классом 'del-item'
$('#cart .modal-body').on('click', '.del-item', function() {
	var id = $(this).data('id'); // id товара, который хотим удалить из корзины
	ajax('/cart/delete', changeCart, { id: id }, id, 'Error!'); // ajax-запрос
	/* $.ajax({
		url: '/cart/delete',
		data: {id: id},
		type: 'GET',
		success: function(res){
			showCart(res);
		},
		error: function(){
			alert('Error!');
		}
	}); */
});

// при изменении инпута корзины
$('body').on('change', '#cart input', function() {
	// если кнопка пересчета корзины заблокирована, разблокируем ее
	if ($('#cart-recalc').attr('disabled')) {
		$('#cart-recalc').attr('disabled', false);
		cartRecalc.productsChange = [];
	}
	if (!cartRecalc.productsChange.includes(this)) {
		cartRecalc.productsChange.push(this);
	}
});

/* // Cart */

/* Currency */

// отслеживаем изменение выпадающего списка валют
$('#currency').change(function() {
	window.location = 'currency/change?curr=' + $(this).val(); // запрашиваем страницу и передаем управление контроллеру валюты
});

// отслеживаем изменение выпадающего списка модификаций
$('.available select').on('change', function() {
	var modId = $(this).val(), // идентификатор (id) выбранного модификатора
		color = $(this).find('option').filter(':selected').data('title'), // цвет выбранного модификатора
		price = $(this).find('option').filter(':selected').data('price'), // цена выбранного модификатора
		basePrice = $('#base-price').data('base'); // базовая цена товара
	// если цена установалена (выбран модификатор), устанавливаем цену модификатора
	if (price) {
		$('#base-price').text(symboleLeft + price + symboleRight);
	}
	else {
		$('#base-price').text(symboleLeft + basePrice + symboleRight); // если пользователь вернулся к базовой версии товара
	}
});

/* // Currency */
