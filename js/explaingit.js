define(['historyview', 'controlbox', 'd3'], function (HistoryView, ControlBox, d3) {
    var prefix = 'ExplainGit',
        openSandBoxes = [],
        open,
        reset,
        explainGit;

    open = function (_args) {
        if (typeof _args == "undefined") {
            // console.log("oops");
        }
        var args = Object.create(_args),
            name = prefix + args.name,
            containerId = name + '-Container',
            container = d3.select('#' + containerId),
            playground = container.select('.playground-container'),
            historyView, originView = null,
            controlBox;

        container.style('display', 'block');

        args.name = name;
        historyView = new HistoryView(args);

        if (args.originData) {
            originView = new HistoryView({
                name: name + '-Origin',
                width: 400,
                height: args.height,
                commitRadius: 15,
                remoteName: 'origin',
                commitData: args.originData
            });

            originView.render(playground);
        }

        controlBox = new ControlBox({
            historyView: historyView,
            originView: originView,
            initialMessage: args.initialMessage
        });

        controlBox.render(playground);

        historyView.render(playground);

        openSandBoxes.push({
            hv: historyView,
            cb: controlBox,
            container: container
        });

        return openSandBoxes[openSandBoxes.length-1];
    };

    reset = function () {
        for (var i = 0; i < openSandBoxes.length; i++) {
            var osb = openSandBoxes[i];
            osb.hv.destroy();
            osb.cb.destroy();
            osb.container.style('display', 'none');
        }

        openSandBoxes.length = 0;
        d3.selectAll('a.openswitch').classed('selected', false);
    };

    explainGit = {
        HistoryView: HistoryView,
        ControlBox: ControlBox,
        generateId: HistoryView.generateId,
        open: open,
        reset: reset
    };

    window.explainGit = explainGit;

    return explainGit;
});