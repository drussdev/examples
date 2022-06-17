var ProgressBarCommon = Backbone.View.extend({
    instanceName: 'view ProgressBarCommon',
    className: 'common-progress-bar',
    template: _.template($('#common-progress-bar-tpl').html()),
    error_txt: 'Sometimes shit is happens!',
    close_view_timeout: 2000,
    events: {
        'click .minimize': 'changeViewSize',
        'click .close': 'closeView'
    },
    initialize: function (values = [], type = '', is_show_one = false) {
        this.values = _.isArray(values) ? values : [];
        this.type = _.isString(type) ? type : '';
        this.progress = 0;
        this.is_show_one = is_show_one;

        this.$progress_bar = $();
        this.$minimize = $();

        this.event = {
            onDone: () => {
            },
            onError: () => {
            }
        };
    },
    getClassName: function () {
        return this.instanceName;
    },
    $getWrapper: function () {
        let $wrapper = $('.common-progress-bar-wrapper');
        if (!$wrapper.length)
            $wrapper = $('<div class="common-progress-bar-wrapper"></div>').appendTo($('body'));

        return $wrapper;
    },
    isShownPanelOneValue: function () {
        return (this.is_show_one && this.values.length === 1) || this.values.length > 1;
    },
    render: function () {
        if(this.isShownPanelOneValue()) {
            this.$el.html(this.template());
            this.setValue();
            this.setPopover();
            this.setTitle();

            this.$getWrapper().append(this.$el);

            this.$el.draggable({
                helper: "move",
                handle: '.draggable-area'
            });
            return this;
        }
    },
    changeViewSize: function () {
        if (this.$el.hasClass('mini-size')) {
            this.$el.removeClass('mini-size');
        } else {
            this.$el.addClass('mini-size');
        }
    },
    setValue: function () {
        this.$progress_bar = this.$el.find('.progress .bar');
        this.$minimize = this.$el.find('.minimize');
        this.$close = this.$el.find('.close');
    },
    setPopover: function () {
        this.$minimize.popover({
            title: 'Reduce size',
            placement: 'auto top',
            trigger: 'hover',
            container: this.$minimize
        });
        this.$close.popover({
            title: "Close<span class=\"clarification\">.<br>The process will continue in the background.</span>",
            placement: 'auto top',
            trigger: 'hover',
            container: this.$close,
            html: true
        });
    },
    renderDone: function () {
        this.$el.addClass('done');
        let $popover_close = this.$el.find('.close.bnt-header-right .popover');
        $popover_close.css({
            top: '-30px',
            left: '-23.4px'
        });
        $popover_close.find('.arrow').css({left: '72.2449%'});
    },
    closeView: function () {
        this.$el.css({opacity: 0});
        setTimeout(() => {
            this.remove();
        }, this.close_view_timeout);
    },
    getDoneTxt: function () {
        let result;
        switch (true) {
            case this.type.indexOf('_download') !== -1:
                result = 'File upload has started';
                break;
            default:
                result = 'Done!';
        }
        return result;
    },
    start: function () {
        let $Dfd = $.Deferred();
        this.progress_function().then(
            (resp) => {
                this.setTitle(this.getDoneTxt());
                this.$progress_bar.addClass('bg-success');

                this.setDone(resp);

                $Dfd.resolve(resp);
            },
            () => {
                this.event.onDone();

                this.setTitle(this.error_txt);
                this.$progress_bar.addClass('progress-bar-danger');
                setRootCss('--box-shadow', 'var(--red-medium)');

                $Dfd.reject();
            }
        );
        return $Dfd.promise();
    },
    setDone: function (resp) {
        this.renderDone();

        this.event.onDone(resp);

        setTimeout(() => {
            this.closeView();
        }, 2000);
    },
    setTitle: function (text = '') {
        text = _.isEmpty(text) ? this.getTitleText() : text;
        this.$el.find('.title').text(text);
    },
    getTitleText: function () {
        let result = '';
        switch (true) {
            case this.type.indexOf('create_pdf') !== -1:
                result = 'Creation of PDF files on the server';
                break;
            default:
                result = 'Some title';
        }
        return result;
    },
    getChunkCount: function () {
        return 5;
    },
    getChunkValues: function () {
        return _.chunk(this.values, this.getChunkCount());
    },
    progress_function: function () {
        let $Dfd = $.Deferred();

        let chunk_values = this.getChunkValues();
        let renderCap = _.after(chunk_values.length, (resp) => {
            $Dfd.resolve(resp);
        });
        if (chunk_values.length > 0) {
            let iterate = 0;
            let done_ids = [];
            let recursiveFoo = () => {
                let values = chunk_values[iterate];
                this.getApi(values).call().then(
                    (resp) => {
                        if (resp.error === undefined) {
                            this.intermediateSuccess(values);
                            if (++iterate < chunk_values.length)
                                recursiveFoo();
                            renderCap(resp);
                            this.progress = iterate / chunk_values.length;
                            this.renderProgress();

                            done_ids = done_ids.concat(values);
                        } else {
                            if (resp.done && resp.done.ids && _.isArray(resp.done.ids))
                                resp.done.ids = resp.done.ids.concat(done_ids);

                            this.handlerError(resp);
                        }
                    },
                    () => {
                        $Dfd.reject();
                    }
                );
            };
            recursiveFoo();
        } else $Dfd.reject();

        return $Dfd.promise();
    },
    handlerError: function (resp) {
    },
    renderProgress: function () {
        this.$progress_bar.css({width: (this.progress * 100) + '%'});
    },
    getApi: function (values) {
        let result;
        switch (true) {
            /*case this.type.indexOf('create_pdf_delivery_note') !== -1:
                result = () => App.api.document.pdfs.delivery_note._async_create(values);
                break;
            case this.type.indexOf('create_pdf_invoice') !== -1:
                result = () => App.api.document.pdfs.invoice._async_create(values);
                break;*/
            case _.isFunction(this.type):
                result = this.type;
                break;
            default:
                result = () => {
                    let $Dfd = $.Deferred();
                    let random = _.random(300, 1500);
                    setTimeout(
                        () => {
                            if(random < 1400)
                                $Dfd.resolve({});
                            else $Dfd.reject();
                        }, random
                    );
                    return $Dfd.promise();
                };
        }
        return result;
    },
    intermediateSuccess: function (values) {
        /*switch (true) {
            case this.type.indexOf('create_pdf') !== -1:
                let Collection = this.type === 'create_pdf_invoice' ? App.instance.invoices : App.instance.deliveryNotes;
                _.each(values, document_id => {
                    let Document = Collection.get(document_id);
                    if (Document !== undefined)
                        Document.set('hasPdf', true);
                });
                break;
        }*/
    }
});

var ProgressBarDurationEstimatedCommon = ProgressBarCommon.extend({
    instanceName: 'view ProgressBarDurationEstimatedCommon',
    processName: 'creating_something',
    initialize: function (data_estimate, api) {
        ProgressBarCommon.prototype.initialize.apply(this, arguments);

        this.count = parseInt(data_estimate.count);
        this.dependencies = parseInt(data_estimate.dependencies);
        this.duration_estimate = parseInt(data_estimate.duration);
        this.api = api;

        this.timeout_id = 0;
    },
    isShownPanelOneValue: function () {
        return true;
    },
    progress_function: function () {
        let $Dfd = $.Deferred();

        let values = _.range(10);
        let renderCap = _.after(values.length, () => {

        });
        if (values.length > 0) {
            let iterate = 0;
            let recursiveFoo = () => {
                if (++iterate < values.length)
                    this.timeout_id = setTimeout(
                        () => {
                            recursiveFoo();
                        }, (this.count * this.duration_estimate / (this.dependencies * values.length))
                    )
                renderCap();
                this.renderProgress();
                this.progress = iterate / values.length;
            };
            recursiveFoo();
        } else $Dfd.reject();

        let momentStart = moment();
        this.runApi().then(
            (resp) => {
                clearTimeout(this.timeout_id);

                let momentFinish = moment();
                let duration = momentFinish - momentStart;

                this.saveDurationData(duration);

                this.progress = 1;
                this.renderProgress();

                $Dfd.resolve(resp);
            }
        );
        return $Dfd.promise();
    },
    saveDurationData: function (duration) {
        if (Math.abs(this.duration_estimate - (duration * this.dependencies / this.count)) > 500)
            App.api.duration_process.save(duration, this.count, this.getProcessName());
    },
    runApi: function () {
        return this.api();
    },
    getProcessName: function () {
        return this.processName;
    },
});

var ProgressBarDurationEstimatedSummaryInvoice = ProgressBarDurationEstimatedCommon.extend({
    processName: 'creating_summary_invoice',
    getTitleText: function () {
        return 'Create Summary Invoice';
    },
});