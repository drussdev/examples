App = {
    timerId: 0
};

var CommonValues = {
    customDelay: (function () {
        let timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
            App.timerId = timer;
        };
    })(),
    getRootCss: function (property) {
        return $(document.documentElement).css(property);
    },

    setRootCss: function (property, value) {
        return $(document.documentElement).css(property, value);
    },
    isValidDecimalNumber: function (n) {
        if (n === null || n === '')
            return false;

        n = "" + n;
        if (n.length > 10)
            return false;

        if (n.indexOf('..') !== -1 || n.indexOf(',,') !== -1)
            return false;

        for (let i = 0; i < n.length; i++) {
            if (i === 0 && n[i] === '-')
                continue;
            if (!this.isDecimalNumberChar(n[i], n))
                return false;
        }
        return true;
    },

    isIntegerNumberChar: function (c) {
        return c == '0' || c == '1' || c == '2' || c == '3' || c == '4' || c == '5' || c == '6' || c == '7' || c == '8' || c == '9';
    },

    isDecimalNumberChar: function (c, str) {
        return this.isIntegerNumberChar(c) || (c == ',' && str.length > 1) || (c == '.' && str.length > 1);
    },

    getPseudoApi: function (is_reject = true) {
        return () => {
            let $Dfd = $.Deferred();
            let random = _.random(300, 1500);
            setTimeout(
                () => {
                    if ((random < 1400 && is_reject) || !is_reject)
                        $Dfd.resolve({});
                    else $Dfd.reject();
                }, random
            );
            return $Dfd.promise();
        }

    }
};


$(function () {
    App.ProgressBar = new ProgressBarCommon(_.range(100), '');
    App.ProgressBar.render();
    App.ProgressBar.start();

    let $inputs_el = $('#InputSellingPriceNumberActive');
    let View = new InputSellingPriceNumberActive('');
    $inputs_el.append(View.render().el);

    $inputs_el = $('#InputPurchasingPriceNumberActive');
    View = new InputPurchasingPriceNumberActive('');
    $inputs_el.append(View.render().el);

    $inputs_el = $('#InputQuantityNumberActive');
    View = new InputQuantityNumberActive('');
    $inputs_el.append(View.render().el);

    $inputs_el = $('#InputQuantityNumberIncreaseDecreaseActive');
    View = new InputQuantityNumberIncreaseDecreaseActive('', 1);
    $inputs_el.append(View.render().el);
});