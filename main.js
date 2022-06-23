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
    App.ProgressBar = new ProgressBarMultiplyRequests(_.range(100), CommonValues.getPseudoApi());
    App.ProgressBar.render();
    App.ProgressBar.start();

    let api = () => {
        let $Dfd = $.Deferred();
        let random = _.random(3000, 10000);
        setTimeout(
            () => {
                $Dfd.resolve();
            }, random
        );
        return $Dfd.promise();
    }
    App.ProgressBarDurationEstimated = new ProgressBarDurationEstimated({count: _.random(10, 50), dependencies: _.random(10, 50), duration: _.random(3000, 10000)}, api);
    App.ProgressBarDurationEstimated.render();
    App.ProgressBarDurationEstimated.start();

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