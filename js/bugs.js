var bzAPI = 'https://bugzilla.mozilla.org/bzapi/';
var bugquery = 'https://bugzilla.mozilla.org/buglist.cgi?';

var queries = [
    {
        product: "Core",
        component: "Graphics: Text"
    },
    {
        product: "Core",
        component: "Internationalization"
    },
    {
        product: "Core",
        component: "JavaScript: Internationalization API"
    },
    {
        product: "Core",
        component: "Layout: Text"
    },
    {
        product: "MailNews Core",
        component: "Internationalization"
    },
    {
        product: "Firefox for Android",
        component: "Keyboards and IME"
    },
    {
        product: "Firefox OS",
        component: "Gaia::Keyboard"
    }
];

var mentored = {
    f1: 'bug_mentor',
    o1: 'isnotempty'
};

function getCount(q, extended, callback) {
    if (callback === undefined) {
        callback = extended;
        extended = undefined;
    }
    var query = $.extend({resolution: '---'}, q, extended);
    $.getJSON(bzAPI + 'count', query, callback);
    return query;
}

queries.forEach(function(q) {
    var tr = $('<tr>');
    var content = [q.product,q.component,q.keyword].filter(function(e){return e;}).join(' / ');
    tr.append($('<td>').text(content));
    var a, query;
    for (var m of [undefined, mentored]) {
        a = $('<a>');
        query = getCount(q, m, (function(target) {
            return function(result) {
                target.text(result.data);
            };
        })(a));
        a.attr('href', bugquery + $.param(query));
        tr.append($('<td>').append(a));
    }
    $("#areas > tbody").append(tr);
});

function intlBugs() {
    var open_intl = {
        resolution: "---",
        keywords: "intl"
    };
    var query = $.extend({
        f1: "product",
        v1: "Graveyard",
        o1: "notsubstring",
        x_axis_field: "product",
        y_axis_field: "component"
    }, open_intl);
    var mentored_query = $.extend({f2: "bug_mentor", o2: "isnotempty"}, query);
    Promise.all([
        $.getJSON(bzAPI + 'count', query).promise().then(arrayToObj),
        $.getJSON(bzAPI + 'count', mentored_query).promise().then(arrayToObj)
    ]).then(function(data) {
        var allBugs = data[0], mentoredBugs = data[1];
        var product, mentored_product, prod, comp, tr;
        var target = $("#intl > tbody");
        for (prod in allBugs) {
            product = allBugs[prod];
            mentored_product = mentoredBugs[prod];
            for (comp in product) {
                tr = $('<tr>');
                tr.append($('<td>').text(prod + ' / ' + comp));
                tr.append($("<td>").append($('<a>').attr('href', bugquery + $.param($.extend({product: prod, component: comp}, open_intl))).text(product[comp])));
                if (mentored_product && mentored_product[comp]) {
                    tr.append($("<td>").append($('<a>').attr('href', bugquery + $.param($.extend({product: prod, component: comp}, mentored, open_intl))).text(mentored_product[comp])));
                }
                else {
                    tr.append($("<td>"));
                }
                target.append(tr);
            }
        }
    });
}
intlBugs();

function arrayToObj(result) {
    var x, y, component, product, object = {};
    for (x = 0; x < result.x_labels.length; ++x) {
        product = {};
        object[result.x_labels[x]] = product;
        for (y = 0; y < result.y_labels.length; ++y) {
            component = result.y_labels[y];
            if (result.data[y][x]) {
                product[component] = result.data[y][x];
            }
        }
    }
    return object;
}