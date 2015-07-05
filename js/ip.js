var IPIDE = IPIDE || {};

IPIDE.IDE = {
    workspaces: [],
    workSpaceCount: -1,
    doneFirst: false,
    newWorkSpace: function () {
        this.workspaces.push(new IPIDE.WorkSpace(++this.workSpaceCount, [], !this.doneFirst));
        if (!this.doneFirst)
            this.doneFirst = true;
    }
};
IPIDE.WorkSpace = function (id, filterSet, first) {
    this.setup(id, filterSet, first);
};
IPIDE.WorkSpace.prototype = {
    setup: function (input_id, filterset, first) {
        //do jquery call to create tabs and workspace
        IPIDE.WorkSpace.id = input_id;
        this.filterSet = filterset;
        console.log("Creating " + input_id);
        if (first)
            active = 'active';
        else
            active = '';

        $("#ip_main").append("<div class='ip_workspace tab-pane fade in " + active + "' id='workspace_" + input_id + "'>" +
            "<div class='col-lg-12 ip_workspace_menu'>" +
            "<form class='form-inline'>" +
            "<input type='file' class='form-control ip_btn' id='file_" + input_id + "'>" +
            "<a class='save btn btn-success ip_btn' id='save_'" + input_id + "'>Save</a>" +
            "<a class='revert btn btn-danger ip_btn' id='revert_'" + input_id + "'>Revert</a>" +
            "<a class='clone btn btn-warning ip_btn' id='revert_'" + input_id + "'>Revert</a>" +
            "</form>" +
            "</div>" +
            "<div class='clearfix'></div>" +
            "<div class='col-lg-10 ip_filterset'><canvas id='canvas_" + input_id + "' class='imagebox'></canvas></div>" +
            "<div class='col-lg-2 filterSet'>" +

            "</div>" +
            "<div class='clearfix'></div>" +
            "</div>").after(function () {
            //setup canvas reference
            console.log('after running ' + IPIDE.WorkSpace.id);
            IPIDE.WorkSpace.canvas = document.getElementById("canvas_" + IPIDE.WorkSpace.id);
            //setup image open event handler
            $("#file_" + IPIDE.WorkSpace.id).change(function (e) {
                var URL = window.webkitURL || window.URL;
                var url = URL.createObjectURL(e.target.files[0]);
                var img = new Image();
                img.src = url;

                img.onload = function () {
                    console.log('got image ' + url);
                    //might not work when the canvas object reference is not resolved : fix it
                    if (IPIDE.WorkSpace.canvas) {
                        console.log('drawing image..' + img.width + "/ " + img.height);
                        //IPIDE.WorkSpace.canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
                        IPIDE.WorkSpace.canvas.getContext("2d").drawImage(img, 0, 0, 100, 100);
                    }

                }
            })
        });

        $("#ip_tabs").append("<li class='" + active + "'><a data-toggle='tab' href='#workspace_" + input_id + "'>Workspace " + input_id + "</a></li>");

        //create event handlers for save, open, revert

        //get canvas reference and store it
    },
    removeMe: function () {
        $("#iworkspace_" + id).remove();
    },
    loadImage: function (img) {

    },
    addFilter : function(filter) {

    }
};

IPIDE.Filter = function () {

};
IPIDE.Filter.prototype = {};
