/**
 * consts - пользовательские константы PHP (get_defined_constants(true)['user'])
 * path - ссылка на главную - абсолютный путь (для ajax-запросов и другого)
 * symboleLeft - символ слева ($ 1)
 * symboleRight - символ справа (1 руб.)
 */

// выгружаем свойства из объекта Ishop (деструктуризация)
const { Consts, Vars } = Ishop;
const { path, symboleLeft, symboleRight } = Vars;
