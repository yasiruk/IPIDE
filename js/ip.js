"use strict";
var IPIDE = IPIDE || {};

IPIDE.IDE = {
    workspaces: [],
    canvases: [],
    filters: [],
    workSpaceCount: -1,
    doneFirst: false,
    init: function () {
        $(document).on("click", "#ide_newworkspace", function (event) {
            event.preventDefault();
            IPIDE.IDE.newWorkSpace();
        });
        $(document).on("change", ".filterlist", IPIDE.IDE.onChangeFilterset);
        $(document).on("click", ".filterapplybtn", function (event) {
            var id = $(event.target).attr("data-ipide-id");
            console.log(event.target);
            console.log("Applyfileters for WS " + id + " pressed");
            IPIDE.IDE.workspaces[id].applyFilters();
        });
        $(document).on("change", ".uploadfile", function (event) {
            var id = $(event.target).attr("data-ipide-id");
            var image = new Image();
            var URL = window.webkitURL || window.URL;
            var url = URL.createObjectURL(event.target.files[0]);
            console.log(event.target.files[0]);
            image.src = url;

            image.onload = function () {
                IPIDE.IDE.workspaces[id].loadImage(image);
                IPIDE.IDE.workspaces[id].setFileName(event.target.files[0].name);
            };
        })
        $(document).on("click", ".revert", function (event) {
            var id = $(event.target).attr("data-ipide-id");
            IPIDE.IDE.workspaces[id].revert();
        });
        $(document).on("click", ".clone", function (event) {
            var id = $(event.target).attr("data-ipide-id");
            var wid = IPIDE.IDE.newWorkSpace();
            var image = new Image();

            image.src = IPIDE.IDE.workspaces[id].canvas.toDataURL();
            IPIDE.IDE.workspaces[wid].loadImage(image);
            IPIDE.IDE.workspaces[wid].setFileName("clone_" + IPIDE.IDE.workspaces[id].fileName);


        });
        $(document).on("click", ".save", function (event) {
            var id = $(event.target).attr("data-ipide-id");
            IPIDE.IDE.workspaces[id].saveAs();
        });
        $(document).on("click", "a.filterclose", function (event) {
            event.preventDefault();
            var wid = $(event.target).attr("data-ipide-id");
            var fid = $(event.target).attr("data-ipide-fid");
            IPIDE.IDE.workspaces[wid].removeFilter(fid);

        });
        $(document).on("click", "a.histogram", function (event) {
            event.preventDefault();
            var id = $(event.target).attr("data-ipide-id");
            IPIDE.IDE.workspaces[id].generateHistogram();
        });
        $(document).on("click", "a.exif", function (event) {
            event.preventDefault();
            var id = $(event.target).attr("data-ipide-id");
            IPIDE.IDE.workspaces[id].showMetada();
        });
    },
    newWorkSpace: function () {
        var wid = this.workspaces.push(new IPIDE.WorkSpace(++this.workSpaceCount, [], !this.doneFirst));
        if (!this.doneFirst)
            this.doneFirst = true;
        return wid - 1;
    },
    onChangeFilterset: function (event) {
        var filterListUI = $(event.target);
        var workspaceId = filterListUI.attr("data-ipide-id");
        var filterId = filterListUI.val();
        if (filterId == -1)
            return;
        console.log(IPIDE.IDE.filters[filterId]);
        IPIDE.IDE.workspaces[workspaceId].addFilter(IPIDE.IDE.filters[filterId]);

    },
    registerFilter: function (filter) {
        filter.filterId = IPIDE.IDE.filters.push(filter) - 1;
        console.log("Registered filter:" + filter.filtername);
        console.log(filter);
    }
};
IPIDE.WorkSpace = function (id, filterSet, first) {
    this.canvas = document.createElement('canvas');
    if (this.canvas)
        console.log("loaded the canvas " + this.id);
    this.filters = [];
    this.img = null;
    this.setup(id, filterSet, first);
};
IPIDE.WorkSpace.prototype = {
    setup: function (input_id, filterset, first) {
        //do jquery call to create tabs and workspace
        this.id = input_id;
        this.filterSet = filterset;
        console.log("Creating " + input_id);
        var active = first ? "active" : "";
        var workspaceCanvas = this.canvas;
        var workspaceImage = this.img;
        //setup the historam object
        this.histogram = Object.create(IPIDE.Histogram);
        $("#ip_main").append("<div class='ip_workspace tab-pane fade in " + active + "' id='workspace_" + input_id + "'>" +
            "<div class='col-lg-9 ip_filterset'>" +
            "<div class='col-lg-12 ip_workspace_menu'>" +
            "<form class='form-inline'>" +
            "<input type='file' accept='image/*' class='form-control ip_btn uploadfile'  data-ipide-id='" + this.id + "' id='file_" + input_id + "'>" +
            "<a class='save btn btn-success ip_btn' id='save_" + input_id + "' data-ipide-id='" + this.id + "'>Save</a>" +
            "<a class='clone btn btn-danger ip_btn' id='clone_" + input_id + "' data-ipide-id='" + this.id + "'>Clone</a>" +
            "<a class='revert btn btn-warning ip_btn' id='revert_" + input_id + "' data-ipide-id='" + this.id + "'>Revert</a>" +
            "<a class='histogram btn btn-warning ip_btn' id='revert_" + input_id + "' data-ipide-id='" + this.id + "'>Histogram</a>" +
            "<a class='exif btn btn-warning ip_btn' id='revert_" + input_id + "' data-ipide-id='" + this.id + "'>View EXIF</a>" +
            "</form>" +
            "</div>" +
            "<div class='clearfix'></div>" +
            "<div class='ip_image_preview'><img id='img_" + input_id + "'></div></div>" +
            "<div class='col-lg-3 filterSet'>" +
            this.getFilterListUI() +
            "</div>" +
            "<div class='clearfix'></div>" +
            "</div>").after(function () {
            //setup canvas reference
            console.log('after running ' + input_id);

        });

        $("#ip_tabs").append("<li class='" + active + "'><a id='iptab_" + this.id + "'data-toggle='tab' href='#workspace_" + input_id + "'>Workspace " + input_id + "</a></li>");

        //create event handlers for save, open, revert

        //get canvas reference and store it
    },
    removeMe: function () {
        $("#iworkspace_" + id).remove();
    },
    setFileName: function (fileName) {
        this.fileName = fileName;
        $("#iptab_" + this.id).html(fileName);
    },
    loadImage: function (img) {
        this.image = img;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.canvas.getContext("2d").drawImage(this.image, 0, 0);
        $("#img_" + this.id).attr("src", img.src);
        console.log("Loaded image: " + img.src);

    },
    addFilter: function (filter) {
        console.log("Added " + filter.filtername + " to workspace " + this.id);
        var filterObj = Object.create(filter);
        filterObj.init(this.canvas, this, this.filters.length);
        console.log($("#filterlistui_" + this.id).append(filterObj.getControlPanel()));
        this.filters.push(filterObj);
    },
    applyFilters: function () {
        this.canvas.getContext("2d").clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.getContext("2d").drawImage(this.image, 0, 0);
        for (var filter of this.filters) {
            if (filter)
                filter.apply(this.id);
        }
        if (this.img == null)
            this.img = document.getElementById('img_' + this.id);
        $("#img_" + this.id).attr("src", this.canvas.toDataURL());
        console.log(this.canvas.toDataURL());
    },
    getFilterListUI: function () {
        var str = "<h3>Filters</h3>" +
            "<div><select id='filterlist_" + this.id + "' class='form-control filterlist' data-ipide-id='" + this.id + "'>\n<option value='-1'>Select filter</option>";

        for (var i = 0; i < IPIDE.IDE.filters.length; i++) {
            str += "<option value='" + IPIDE.IDE.filters[i].filterId + "'>" + IPIDE.IDE.filters[i].getName() + "</option>\n";
        }
        str += "</select>";
        str += "</div>";
        str += "<div class='panel-group' id='filterlistui_" + this.id + "'></div>";
        str += "<button id='applyfilters_" + this.id + "' data-ipide-id='" + this.id + "'name='singlebutton' class='filterapplybtn btn btn-default'>Apply Filters</button>";
        //setup eventhandlers

        return str;
    },
    revert: function () {
        this.loadImage(this.image);
    },
    saveAs: function () {
        var filename = this.fileName;
        this.canvas.toBlob(function (blob) {
            saveAs(blob, filename.replace(/\.[^/.]+$/, ".png"));
        }, "image/png");
    },
    generateHistogram: function () {
        this.imageData = this.canvas.getContext('2d').getImageData(0, 0, this.canvas.width, this.canvas.height);
        var data = this.imageData.data;
        this.histogram = Object.create(IPIDE.Histogram);
        for (var i = 0; i < data.length; i += 4) {
            this.histogram.putR(data[i]);
            this.histogram.putG(data[i + 1]);
            this.histogram.putB(data[i + 2]);
        }

        var histsrc = this.histogram.getHistogramSrc();
        $("#ipide-modal-content").html("<img src='" + histsrc + "'>").after(function () {
            $("#ipide-modal-heading").html("Histogram").after(function () {
                $("#largeModal").modal('show');
            });
        });
    },
    removeFilter: function (filterid) {
        var filteruiid = "#filtercp_" + IPIDE.IDE.workspaces[this.id].filters[filterid].uiid;
        $(filteruiid).remove();
        this.filters.splice(filterid, 1, null); //hack :/ added null to not to mess up the index references of following filters
    },
    showMetada: function () {
        EXIF.getData(this.image, function () {
            var content = EXIF.pretty(this);
            var myfilename = this.fileName;
            content = content.replace(/(?:\r\n|\r|\n)/g, '<br />');
            if (content.length < 2) {
                content = "No exif data found!";
            }
            console.log(content);
            $("#ipide-modal-content").html(content).after(function () {
                $("#ipide-modal-heading").html("EXIF data of " + myfilename).after(function () {
                    $("#largeModal").modal('show');
                });
            });
        });
    }


};
IPIDE.Histogram = {
    r: [],
    g: [],
    b: [],
    gs: [],
    tr: 0,
    tg: 0,
    tb: 0,
    rmax: 0,
    gmax: 0,
    bmax: 0,
    gsmax: 0,

    canvas: document.createElement("canvas"),
    putR: function (val) {
        this.r[val] = (this.r[val]) ? this.r[val] : 0;
        this.gs[val] = (this.gs[val]) ? this.gs[val] : 0;
        this.r[val]++;
        if (this.rmax < this.r[val])
            this.rmax = this.r[val];
        this.tr++;
        this.gs[val]++;
        if (this.gsmax < this.gs[val])
            this.gsmax = this.gs[val];
    },
    putG: function (val) {
        this.g[val] = (this.g[val]) ? this.g[val] : 0;
        this.gs[val] = (this.gs[val]) ? this.gs[val] : 0;
        this.g[val]++;
        if (this.gmax < this.g[val])
            this.gmax = this.g[val];
        this.tg++;
        this.gs[val]++;
        if (this.gsmax < this.gs[val])
            this.gsmax = this.gs[val];
    },
    putB: function (val) {
        this.b[val] = (this.b[val]) ? this.b[val] : 0;
        this.gs[val] = (this.gs[val]) ? this.gs[val] : 0;
        this.b[val]++;
        if (this.bmax < this.b[val])
            this.bmax = this.b[val];
        this.tb++;
        this.gs[val]++;
        if (this.gsmax < this.gs[val])
            this.gsmax = this.gs[val];
    },
    getHistogramSrc() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 512;
        this.canvas.height = 100;
        var barlen = 2, barheight;
        var ctx = this.canvas.getContext('2d');
        console.log(this.canvas);
        ctx.clearRect(0, 0, 512, 100);
        ctx.fillStyle = "black";
        for (var i = 0; i < 256; i++) {
            if (this.gs[i]) {
                barheight = (this.gs[i] / this.gsmax ) * 90;
                ctx.fillRect(i * barlen, barheight, barlen, 100 - barheight);
                //console.log(barheight);
            }
        }
        console.log(this.canvas.toDataURL());
        return this.canvas.toDataURL();
    }
}
IPIDE.Filter = {
    name: "Default filter",
    init: function (canvas, workspace, id) {
        this.canvas = canvas;
        this.id = id;
        this.uiid = workspace.id + "_" + id;
        this.workspace = workspace;
        this.ctx = this.canvas.getContext("2d");
        console.log('Filter : created canvas ' + this.canvas.width + " , " + this.canvas.height);
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.filtername = "Default Filter";
        this.controlPanel = "Default Control Panel";
        this.filterId = -1;
    },
    applyFilter: function () {
        image.src = canvas.toDataURL();
        return image;
    },
    getName: function () {
        return this.name;
    },
    getCloseButton() {
        return "<a href='#' class='filterclose' data-ipide-id='" + this.workspace.id + "' data-ipide-fid='" + this.id + "'>remove</a>";
    }
};


IPIDE.ChannelFilter = Object.create(IPIDE.Filter);
IPIDE.ChannelFilter.name = "Channel Filter";
IPIDE.ChannelFilter.apply = function () {
    var id = this.uiid;
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = this.imageData.data;
    var redval = ($("#red_" + id).is(":checked") ) ? 1 : 0;
    var blueval = ($("#blue_" + id).is(":checked") ) ? 1 : 0;
    var greenval = ($("#green_" + id).is(":checked") ) ? 1 : 0;

    for (var i = 0; i < data.length; i += 4) {
        data[i] *= redval;
        data[i + 1] *= greenval;
        data[i + 2] *= blueval;
    }
    this.ctx.putImageData(this.imageData, 0, 0);
    console.log("filter url: " + this.canvas.toDataURL());
};
IPIDE.ChannelFilter.getControlPanel = function () {
    console.log("Channel filter CP returned");
    var id = this.uiid;
    var str = "<div class='filtercontrolpanel' id='filtercp_" + id + "'>" + this.getCloseButton() + "<h4>" + this.getName() + "</h4>"
    str += "<label><input type='checkbox' id='red_" + id + "' name='red'>Red</label>";
    str += "<label><input type='checkbox' id='green_" + id + "' name='green'>Green</label>";
    str += "<label><input type='checkbox' id='blue_" + id + "' name='blue'>Blue</label>";
    str += "</div>";
    return str;
};

//Register the Channel Filter
IPIDE.IDE.registerFilter(IPIDE.ChannelFilter);


IPIDE.NegativeFilter = Object.create(IPIDE.Filter);

IPIDE.NegativeFilter.name = "Negative Filter";
IPIDE.NegativeFilter.apply = function () {
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = this.imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
    this.ctx.putImageData(this.imageData, 0, 0);
};
IPIDE.NegativeFilter.getControlPanel = function () {
    var id = this.uiid;
    var str = "<div class='filtercontrolpanel' id='filtercp_" + id + "'>" + this.getCloseButton() + "<h4>" + this.getName() + "</h4></div>";
    return str;
};
//Register the Negative Filter
IPIDE.IDE.registerFilter(IPIDE.NegativeFilter);

IPIDE.BrightnessFilter = Object.create(IPIDE.Filter);
IPIDE.BrightnessFilter.name = "Brightness Filter";
IPIDE.BrightnessFilter.apply = function () {
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = this.imageData.data;
    var bump = parseInt($("#brightness_" + this.uiid).val());
    console.log("Brightness bump " + bump);
    for (var i = 0; i < data.length; i += 4) {
        data[i] += bump;
        data[i + 1] += bump;
        data[i + 2] += bump;
    }
    this.ctx.putImageData(this.imageData, 0, 0);
}
IPIDE.BrightnessFilter.getControlPanel = function () {
    var str = "<div class='filtercontrolpanel' id='filtercp_" + this.uiid + "'>" +
        this.getCloseButton() +
        "<h4>" + this.getName() +
        "</h4><input type='range' min='-225' max='255' value='0' id='brightness_" + this.uiid + "'> </div>";
    return str;
}

IPIDE.IDE.registerFilter(IPIDE.BrightnessFilter);

IPIDE.ContrastFilter = Object.create(IPIDE.Filter);
IPIDE.ContrastFilter.name = "Contrast Filter";
IPIDE.ContrastFilter.apply = function () {
    this.imageData = this.canvas.getContext("2d").getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = this.imageData.data;
    var factor = parseFloat($("#contrast_" + this.uiid).val());
    console.log("Contrast factor " + factor + " " + this.uiid);
    for (var i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
    this.ctx.putImageData(this.imageData, 0, 0);
};
IPIDE.ContrastFilter.getControlPanel = function () {
    var str = "<div class='filtercontrolpanel' id='filtercp_" + this.uiid + "'>" +
        this.getCloseButton() +
        "<h4>" + this.getName() +
        "</h4><input type='range' min='0' max='2' step='0.01' value='1' id='contrast_" + this.uiid + "'> </div>";
    return str;
};
IPIDE.IDE.registerFilter(IPIDE.ContrastFilter);

IPIDE.ResizeFilter = Object.create(IPIDE.Filter);
IPIDE.ResizeFilter.name = "Resize";

IPIDE.ResizeFilter.apply = function () {
    var mycanvas = this.canvas;
    var myctx = mycanvas.getContext("2d");
    var imgurl = mycanvas.toDataURL();
    var image = new Image();

    var new_width = 100;
    var new_height = 100;

    image.onload = function () {
        mycanvas.width = new_width;
        mycanvas.height = new_height;
        mycanvas.getContext("2d").drawImage(image, 0, 0, new_width, new_height);
        console.log("resized " + mycanvas.width);
        console.log(mycanvas.toDataURL());

    }
    image.src = imgurl;
};

IPIDE.ResizeFilter.getControlPanel = function () {
    var str = "<div class='filtercontrolpanel' id='filtercp_" + this.uiid + "'>" +
        this.getCloseButton() +
        "<h4>" + this.getName() +
        "</h4></div>";
    return str;
};

IPIDE.IDE.registerFilter(IPIDE.ResizeFilter);

IPIDE.LOGFilter5 = Object.create(IPIDE.Filter);
IPIDE.LOGFilter5.name = "5x5 LOG Filter";
IPIDE.LOGFilter5.apply = function () {
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = this.imageData.data;
    var cwidth = this.canvas.width;
    var cheight = this.canvas.height;
    var temp, convolv;

    console.log("5x5 LOG Filter");
    var kernel =
            [
                0, 0, -1, 0, 0,
                0, -1, -2, -1, 0,
                -1, -2, 16, -2, -1,
                0, -1, -2, -1, 0,
                0, 0, -1, 0, 0
            ]
        ;
    for (var i = 0; i < cheight; i++) {
        for (var j = 0; j < cwidth; j++) {
            //grayscale the image
            data[4 * (j + cwidth * i)] = data[4 * (j + cwidth * i) + 1] = data[4 * (j + cwidth * i) + 2] = Math.round(
                (data[4 * (j + cwidth * i)] * 0.2989) + //r
                (data[4 * (j + cwidth * i) + 1] * 0.5870) + //g
                (data[4 * (j + cwidth * i) + 2] * 0.1140)   //b
            );
        }
    }
    var dataCopy = new Uint8ClampedArray(data);
    for (var i = 5; i < cheight - 5; i++) {
        for (var j = 5; j < cwidth - 5; j++) {
            temp = 0;
            for (var k = -2; k <= 2; k++) {
                for (var l = -2; l <= 2; l++) {
                    temp += Math.round(((data[4 * (((j + l) + cwidth * (i + k)))]) * kernel[(2 + l) + 5 * (2 + k)]));
                }
            }
            dataCopy[4 * (j + cwidth * i)] = dataCopy[4 * (j + cwidth * i) + 1] = dataCopy[4 * (j + cwidth * i) + 2] = Math.round(temp);
        }
    }
    this.imageData.data.set(dataCopy);
    this.ctx.putImageData(this.imageData, 0, 0);
}
IPIDE.LOGFilter5.getControlPanel = function () {
    var str = "<div class='filtercontrolpanel' id='filtercp_" + this.uiid + "'>" +
        this.getCloseButton() +
        "<h4>" + this.getName() +
        "</h4></div>";
    return str;
}

IPIDE.IDE.registerFilter(IPIDE.LOGFilter5);


IPIDE.LOGFilter9 = Object.create(IPIDE.Filter);
IPIDE.LOGFilter9.name = "7x7 LOG Filter";
IPIDE.LOGFilter9.apply = function () {
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = this.imageData.data;
    var cwidth = this.canvas.width;
    var cheight = this.canvas.height;
    var temp;

    console.log("7x7 LOG Filter");
    var kernel =
            [
                0, 0, 1, 1, 1, 0, 0,
                0, 1, 3, 3, 3, 1, 0,
                1, 3, 0, -7, 0, 3, 1,
                1, 3, -7, -24, -7, 3, 1,
                1, 3, 0, -7, 0, 3, 1,
                0, 1, 3, 3, 3, 1, 0,
                0, 0, 1, 1, 1, 0, 0
            ]
        ;
    for (var i = 0; i < cheight; i++) {
        for (var j = 0; j < cwidth; j++) {
            //grayscale the image
            data[4 * (j + cwidth * i)] = data[4 * (j + cwidth * i) + 1] = data[4 * (j + cwidth * i) + 2] = Math.round(
                (data[4 * (j + cwidth * i)] * 0.2989) + //r
                (data[4 * (j + cwidth * i) + 1] * 0.5870) + //g
                (data[4 * (j + cwidth * i) + 2] * 0.1140)   //b
            );
        }
    }
    var dataCopy = new Uint8ClampedArray(data);
    for (var i = 7; i < cheight - 7; i++) {
        for (var j = 7; j < cwidth - 7; j++) {
            temp = 0;
            for (var k = -3; k <= 3; k++) {
                for (var l = -3; l <= 3; l++) {
                    temp += Math.round(((data[4 * (((j + l) + cwidth * (i + k)))]) * kernel[(3 + l) + 7 * (3 + k)]));
                }
            }
            dataCopy[4 * (j + cwidth * i)] = dataCopy[4 * (j + cwidth * i) + 1] = dataCopy[4 * (j + cwidth * i) + 2] = temp;
        }
    }
    this.imageData.data.set(dataCopy);
    this.ctx.putImageData(this.imageData, 0, 0);
}
IPIDE.LOGFilter9.getControlPanel = function () {
    var str = "<div class='filtercontrolpanel' id='filtercp_" + this.uiid + "'>" +
        this.getCloseButton() +
        "<h4>" + this.getName() +
        "</h4></div>";
    return str;
}

IPIDE.IDE.registerFilter(IPIDE.LOGFilter9);


IPIDE.CustomKernelFilter = Object.create(IPIDE.Filter);
IPIDE.CustomKernelFilter.name = "3x3 Custom Filter";
IPIDE.CustomKernelFilter.apply = function () {
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var data = this.imageData.data;
    var cwidth = this.canvas.width;
    var cheight = this.canvas.height;
    var temp;

    console.log("3x3 Custom Filter");
    var inputtext = $("#ckfilter_" + this.uiid).val().split(",");
    var kernel =
            [
                0,0,0,
                0,0,0,
                0,0,0
            ]
        ;
    for (var i  = 0;i < inputtext.length;i++) {
        kernel[i] = parseInt(inputtext[i]);
    }

    for (var i = 0; i < cheight; i++) {
        for (var j = 0; j < cwidth; j++) {
            //grayscale the image
            data[4 * (j + cwidth * i)] = data[4 * (j + cwidth * i) + 1] = data[4 * (j + cwidth * i) + 2] = Math.round(
                (data[4 * (j + cwidth * i)] * 0.2989) + //r
                (data[4 * (j + cwidth * i) + 1] * 0.5870) + //g
                (data[4 * (j + cwidth * i) + 2] * 0.1140)   //b
            );
        }
    }
    var dataCopy = new Uint8ClampedArray(data);
    for (var i = 3; i < cheight - 3; i++) {
        for (var j = 3; j < cwidth - 3; j++) {
            temp = 0;
            for (var k = -1; k <= 1; k++) {
                for (var l = -1; l <= 1; l++) {
                    temp += Math.round(((data[4 * (((j + l) + cwidth * (i + k)))]) * kernel[(1 + l) + 3 * (1 + k)]));
                }
            }
            dataCopy[4 * (j + cwidth * i)] = dataCopy[4 * (j + cwidth * i) + 1] = dataCopy[4 * (j + cwidth * i) + 2] = temp;
        }
    }
    this.imageData.data.set(dataCopy);
    this.ctx.putImageData(this.imageData, 0, 0);
}
IPIDE.CustomKernelFilter.getControlPanel = function () {
    var str = "<div class='filtercontrolpanel' id='filtercp_" + this.uiid + "'>" +
        this.getCloseButton() +
        "<h4>" + this.getName() +
        "</h4><input type='text' id='ckfilter_"+this.uiid+"' placeholder='1,2,3,4,5,6,7,8,9'></div>";
    return str;
}

IPIDE.IDE.registerFilter(IPIDE.CustomKernelFilter);