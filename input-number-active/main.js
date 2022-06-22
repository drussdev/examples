var InputNumberActive = Backbone.View.extend({
    className: 'wrap-input-number-active',
    class_input: '',
    template: _.template($('#input-number-active').html()),
    $spinner: $('<i class="fa fa-spinner fa-spin fa-fw"></i>'),
    digits_after_comma: 2,
    placeholder_text: '',
    enterKeyActive: false,
    events: {
        'focus input': _.throttle(function(e) {this.focusInput(e)}, 10),
        'change input': 'changeInput',
        'blur input': 'blurInput',
        'keyup input': 'keyupInput',
        'keydown input': 'keydownInput',
    },
    initialize: function (value, api) {
        this.value = this.getPrepareValue(value);
        this.api = this.getPrepareApi(api);

        this.event = {
            onSave: function (value) {
            },
            onSaved: function () {
            },
            onFocus: function () {
            },
            onChange: function () {
            },
            onBlur: function () {
            },
            onKeyUp: () =>{}
        }
    },
    setClassNameInput: function (class_add = '') {
        this.class_input += ' ' + class_add;
    },
    getValue: function () {
        return this.getPrepareValue(this.$input.val());
    },
    setValue: function (value, is_blur = true) {
        this.$input.val(this.formatValueRender(value));

        if(is_blur)
            this.$input.trigger('blur');
        else this.value = this.getPrepareValue(value);
    },
    render: function () {
        let value_formatted = this.formatValueRender(this.value);
        this.$el.html(this.template({
            class_input: this.class_input,
            value: value_formatted
        }));
        this.$input = this.$el.find('input');
        this.setInputMaxlength();
        this.setPlaceholder();

        return this;
    },
    setPlaceholder: function () {
        this.$input.attr('placeholder', this.placeholder_text);
    },
    isReadOnly: function () {
        return this.$input.hasClass('readonly') || this.$input.prop('readonly');
    },
    focusInput: function () {
        setTimeout(() => {
            if(this.$input.is(':focus') && !this.isReadOnly()) {
                this.$input.select();
                this.event.onFocus();
            }
        }, 30);
    },
    changeInput: function (e) {
        this.event.onChange();
    },
    blurInput: function (e) {
        let $target = $(e.currentTarget);
        let value_str = $target.val();
        let value = this.getPrepareValue(value_str);

        if (value !== this.value)
            this.saveValue(value);

        $target.val(this.formatValueRender(value));
        this.event.onBlur();
    },
    getOnSaveResultValue: function () {
        return this.value;
    },
    saveValue: function (value) {
        this.value = value;
        this.event.onSave(this.getOnSaveResultValue());

        this.$input.after(this.$spinner);
        this.renderSpinner();
        this.$input.addClass('inactive');

        this.api().then(
            (resp) => {
                this.$spinner.remove();
                this.$input.removeClass('inactive');

                this.event.onSaved(this.value, resp);

                this.renderResultApi();
            },
            () => {
                this.$input.removeClass('inactive');
            }
        );
    },
    renderResultApi: function () {
        let $saved = this.$el.siblings('.saved');
        if($saved.length === 0)
            $saved = $('<div class="saved flex-center"></div>').insertAfter(this.$el);

        $saved.text('The value saved: ' + this.value);
    },
    renderSpinner: function () {
    },
    keydownInput: function (e) {
        if ((e.key).match(/^([a-z]|( )){1}$/i) !== null && e.ctrlKey === false)
            return false;
    },
    keyupInput: function (e) {
        let value = this.$input.val();
        let new_value = value.replace(/[\sa-z-]/ig, '').replace(/[,\.]{2,}/g, '.');

        new_value = this.getPrepareValue(new_value);
        if (new_value > this.MAX_VALUE)
            this.$input.val(this.MAX_VALUE);

        if(this.enterKeyActive && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            let value = this.getValue();
            this.setValue(value);
        }

        this.event.onKeyUp(new_value);
    },
    parseFloatDotComma: function (value) {
        let str_value = value.toString().replace(/\./, '').replace(/,/, '.');
        return parseFloat(Number(str_value).toFixed(this.digits_after_comma));
    },
    parseFloatComma: function (value) {
        let str_value = value.toString().replace(/,/, '.');
        return parseFloat(Number(str_value).toFixed(this.digits_after_comma));
    },
    getPrepareApi: function (api) {
        if (typeof api !== 'function') {
            api = this.getPseudoApi(false);
        }
        return api;
    }
});
_.extend(InputNumberActive.prototype, CommonValues);


var InputPriceNumberActive = InputNumberActive.extend({
    MAX_VALUE: 9999.99,
    class_input: 'unit-price-input-number-active',
    setInputMaxlength: function () {
        this.$input.attr('maxlength', 7);
    },
    getPrepareValue: function (value) {
        let result;
        value = value === null ? '' : value.toString();
        switch (true) {
            case (value === 'TP' || value === 'null' || value === '' || !this.isValidDecimalNumber(value)):
                result = '';
                break;
            case value.match(/\d+\.\d{3},\d+/) !== null:
                result = this.parseFloatDotComma(value);
                break;
            default:
                result = this.parseFloatComma(value);
        }
        result = isNaN(result) ? '' : result;
        result  = result < 0 ? 0 : result;
        return result;
    },
    formatValueRender: function (value) {
        value = (typeof value === 'number') ? value.toFixed(2) : value;
        return value.toString().replace(',', '.');
    }
});

var InputPurchasingPriceNumberActive = InputPriceNumberActive.extend({
    getPrepareValue: function (value) {
        value = InputPriceNumberActive.prototype.getPrepareValue.apply(this, arguments);
        value = value === '' ? 0 : value;
        return value;
    }
});
var InputSellingPriceNumberActive = InputPriceNumberActive.extend({
    placeholder_text: 'TP',
    getOnSaveResultValue: function () {
        return this.value === '' ? null : this.value;
    },
});

var InputQuantityNumberActive = InputNumberActive.extend({
    enterKeyActive: true,
    digits_after_comma: 3,
    MAX_VALUE: 9999.999,
    class_input: 'quantity-input-number-active',
    setInputMaxlength: function () {
        this.$input.attr('maxlength', 8);
    },
    getPrepareValue: function (value) {
        let result;
        value = value.toString();
        switch (true) {
            case value.match(/\d+\.\d{3},\d+/) !== null:
                result = this.parseFloatDotComma(value);
                break;
            default:
                result = this.parseFloatComma(value);
        }
        result = isNaN(result) ? 0 : result;
        result  = result < 0 ? 0 : result;

        return result;
    },
    formatValueRender: function (value) {
        return value.toString().replace(/\.0+$/, '').replace(/\,/g, '.');
    },
});

var InputQuantityNumberIncreaseDecreaseActive = InputQuantityNumberActive.extend({
    template: _.template($('#input-quantity-number-increase-decrease-active').html()),
    className: 'wrap-input-number-active input-quantity-number-increase-decrease-active',
    MIN_VALUE: 0.5,
    events: function () {
        return _.extend({}, InputQuantityNumberActive.prototype.events, {
            'click .increase': 'increaseQuantity',
            'click .decrease': 'decreaseQuantity',
        });
    },
    initialize: function (value, api) {
        InputQuantityNumberActive.prototype.initialize.apply(this, arguments);
        this.delay_saving_ms = !api ? 0 : _.random(1000, 2000);
    },
    increaseQuantity: function (e) {
        let value = this.getValue();
        switch (true) {
            case value >= 0 && value < 0.5:
                value = 0.5;
                break;
            case value === 0.5:
                value = 1;
                break;
            default:
                value++;
        }
        if (value > this.MAX_VALUE)
            value = this.MAX_VALUE;

        this.$input.val(this.formatValueRender(value));

        this.saveValueIncreaseDecrease();
    },
    decreaseQuantity: function (e) {
        let value = this.getValue();
        switch (true) {
            case value <= 1 && value > 0.5:
                value = 0.5;
                break;
            default:
                value--;
        }
        if (value < this.MIN_VALUE)
            value = this.MIN_VALUE;

        this.$input.val(this.formatValueRender(value));

        this.saveValueIncreaseDecrease();
    },
    saveValueIncreaseDecrease: function () {
        this.customDelay(()=>{
            this.$input.trigger('blur');
            this.$input.prop('disabled', false);
        }, this.delay_saving_ms);
    }
});
