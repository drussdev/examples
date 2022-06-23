var ProgressBarMultiplyRequests = Backbone.View.extend({
    instanceName: 'view ProgressBarCommon',
    className: 'common-progress-bar',
    title: 'Some title',
    template: _.template($('#common-progress-bar-tpl').html()),
    error_txt: 'Sometimes shit is happens!',
    done_text: 'Done',
    close_view_timeout: 2000,
    events: {
        'click .minimize': 'changeViewSize',
        'click .close': 'closeView'
    },
    initialize: function (values = [], api = '', is_show_one = false) {
        this.values = _.isArray(values) ? values : [];
        this.api = (_.isFunction(api)) ? api : this.getApi(values);
        this.progress = 0;
        this.is_show_one = is_show_one;

        this.$progress_bar = $();
        this.$minimize = $();
        this.$title = $();

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
        if (this.isShownPanelOneValue()) {
            this.$el.html(this.template());
            this.setValue();
            this.setPopover();
            this.setTitleText();

            this.$getWrapper().append(this.$el);

            this.$el.draggable({
                helper: "move",
                handle: '.draggable-area'
            });
            return this;
        }
    },
    changeViewSize: function () {
        this.$el.toggleClass('mini-size');
        this.$title.find('span').toggleClass('hidden', this.$el.hasClass('mini-size'))
    },
    setValue: function () {
        this.$progress_bar = this.$el.find('.progress .bar');
        this.$title = this.$el.find('.title');
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
        this.$progress_bar.addClass('progress-bar-success');
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
        return this.done_text;
    },
    start: function () {
        let $Dfd = $.Deferred();
        this.progress_function().then(
            (resp) => {
                this.setTitleText(this.getDoneTxt());
                this.$progress_bar.addClass('bg-success');

                this.setDone(resp);

                $Dfd.resolve(resp);
            },
            () => {
                this.event.onDone();

                this.setTitleText(this.error_txt);
                this.$progress_bar.addClass('progress-bar-danger');
                this.setRootCss('--box-shadow', 'var(--red-medium)');

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
    setTitleText: function (text = '') {
        text = _.isEmpty(text) ? this.getTitleText() : text;
        this.$el.find('.title span').text(text);
    },
    getTitleText: function () {
        return this.title;
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
    getApi: function () {
        return this.api;
    },
    intermediateSuccess: function (values) {
    }
});
_.extend(ProgressBarMultiplyRequests.prototype, CommonValues);

var ProgressBarDurationEstimated = ProgressBarMultiplyRequests.extend({
    instanceName: 'view ProgressBarDurationEstimatedCommon',
    processName: 'creating_something',
    initialize: function (data_estimate, api) {
        ProgressBarMultiplyRequests.prototype.initialize.apply(this, arguments);

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
                    this.timeout_id =
                        setTimeout(
                            () => {
                                recursiveFoo();
                            }, (this.count * this.duration_estimate / (this.dependencies * values.length))
                        );
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
            console.log('sent to backend: new duration ' + duration + 'ms, count: ' + this.count + ', process_name: ' + this.getProcessName());
    },
    runApi: function () {
        return this.api();
    },
    getProcessName: function () {
        return this.processName;
    },
});