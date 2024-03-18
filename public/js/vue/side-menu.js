/*
* Side Menu
*/

$(document).on("app-loaded", function () {

    new Vue({
        el: '#side-menu',
        delimiters: ["[[", "]]"],
        data: {
            route: {},
            theme_settings: {},
            current_doctype: '',
            current_page: '',
            is_dashboard: false,
            is_shown_mobile_menu: false,
            menu_items_animate: 'slideInLeft',
            module_icon: {
                "Home": "fal fa-home-lg-alt",
                "Programs Management": "fal fa-server",
                "Data Entry": "fal fa-tools",
                "Reporting": "fal fa-shield-check",
                "MEAL Management": "flaticon-browser",
                "Accounting": "fal fa-usd-circle",
                "Agriculture": "flaticon-agriculture",
                "Assets": "fal fa-archive",
                "Build": "fal fa-tools",
                "Buying": "fal fa-shopping-cart",
                "CRM": "fal fa-chart-pie",
                "Customization": "fal fa-sliders-h",
                "Education": "fal fa-graduation-cap",
                "Healthcare": "fal fa-first-aid",
                "HR": "flaticon-businessman",
                "Integrations": "flaticon-combine",
                "Loans": "fal fa-money-check-alt",
                "Loan Management": "fal fa-money-check-alt",
                "Manufacturing": "flaticon-industry",
                "Non Profit": "fal fa-hands-heart",
                "Payroll": "fal fa-file-invoice-dollar",
                "Projects": "fal fa-server",
                "Quality": "fal fa-shield-check",
                "Retail": "flaticon-pos",
                "Selling": "fal fa-bags-shopping",
                "Stock": "fal fa-box-alt",
                "Support": "fal fa-headset",
                "Tools": "fal fa-poll-people",
                "Users": "fal fa-users",
                "Website": "flaticon-browser",
                "Settings": "fal fa-cog",
                "Utilities": 'flaticon-configuration'
            },
            modules_list: [],
            module_items_list: {},
            active_module: {}
        },
        methods: {
            get_modules: function (callback) {
                const $this = this;
                frappe.call({
                    type: 'POST',
                    method: 'frappe.desk.desktop.get_desk_sidebar_items',
                    args: {},
                    callback: callback
                });
            },
            get_module_items: function (module = '', callback) {
                const $this = this;
                frappe.call({
                    type: 'POST',
                    method: 'frappe.desk.desktop.get_desktop_page',
                    args: {page: module},
                    callback: callback
                });
            },
            get_module_name_from_doctype: function () {
                const $this = this;
                $this.route = frappe.get_route();
                $this.current_doctype = ($this.route && $this.route.length >= 2 && $this.route[1]) ? $this.route[1] : '';
                $this.is_dashboard = ($this.route && $this.route.length == 2 && $this.route[1] && $this.route[0] && $this.route[0] == 'dashboard-view') ? true : false;
                frappe.call({
                    type: 'POST',
                    method: 'datavalue_theme.api.get_module_name_from_doctype',
                    args: {
                        doc_name: $this.current_doctype,
                        current_module: ($this.active_module && $this.active_module.name) ? $this.active_module.name : ''
                    },
                    callback: function (response) {
                        // console.log('get_module_name_from_doctype', response.message);
                        let current_module = (response.message && response.message[0] && response.message[0].module) ? response.message[0].module : localStorage.getItem('current_workspace');
                        if ($this.is_dashboard) {
                            current_module = $this.route[1];
                        }
                        $this.is_shown_mobile_menu = $this.is_mobile();
                        $this.module_menu_list(current_module);
                    }
                });
            },
            module_menu_list: function (current_module) {
                const $this = this;
                if ($this.modules_list.length) {
                    $this.active_module = $this.modules_list.filter(function (module) {
                        return module.name == current_module;
                    })[0];
                    if ($this.active_module && $this.active_module.name) {
                        if ($this.module_items_list[$this.active_module.name] && $this.module_items_list[$this.active_module.name].length) {
                            $this.after_side_menu_items();
                        } else {
                            $this.get_module_items($this.active_module.name, function (items) {
                                if (items.message && items.message.cards && items.message.cards.items) {
                                    $this.$set($this.module_items_list, $this.active_module.name, items.message.cards.items);
                                }
                                $this.after_side_menu_items();
                            });
                        }
                        $this.after_side_menu();
                    }
                } else {
                    $this.get_modules(function (result) {
                        // console.log('result.message', result.message);
                        $this.modules_list = result.message;
                        $this.active_module = result.message.filter(function (module) {
                            return module.name == current_module;
                        })[0];
                        $(".splash").hide();
                        if ($this.active_module && $this.active_module.name) {
                            if ($this.module_items_list[$this.active_module.name] && $this.module_items_list[$this.active_module.name].length) {
                                $this.after_side_menu_items();
                            } else {
                                $this.get_module_items($this.active_module.name, function (items) {
                                    if (items.message && items.message.cards && items.message.cards.items) {
                                        $this.$set($this.module_items_list, $this.active_module.name, items.message.cards.items);
                                    }
                                    // console.log('___$this.module_items_list_+++++++++++++++++__', $this.module_items_list[$this.active_module.name])
                                    $this.after_side_menu_items();
                                });
                            }
                            $this.after_side_menu();
                        }
                    });
                }
            },
            after_side_menu: function () {
                const $this = this;
                setTimeout(() => {
                    $('.side-menu .side-menu-icons > ul').niceScroll({
                        cursorcolor: "rgba(0,0,0,0.35)",
                        cursorborder: "0px",
                        cursorwidth: "3px",
                    });
                    let gravity = 'w';
                    if ($('body').hasClass('frappe-rtl')) {
                        gravity = 'e';
                    }
                    $('[data-toggle="tipsy"]').tipsy({fade: false, gravity: gravity});
                }, 500);
                setTimeout(() => {
                    let top = $('.side-menu .side-menu-icons > ul > li.active').position().top + 25;
                    let height = $('.side-menu .side-menu-icons > ul').height();
                    if (top >= height) {
                        $('.side-menu .side-menu-icons > ul').getNiceScroll(0).doScrollPos(0, top);
                    } else if (top <= 0) {
                        $('.side-menu .side-menu-icons > ul').getNiceScroll(0).doScrollTop(0, 300);
                    }
                }, 800);
                this.current_page = $('.content.page-container:visible', document);
            },
            after_side_menu_items: function () {
                const $this = this;
                $this.route = frappe.get_route();
                $this.current_doctype = ($this.route && $this.route.length >= 2 && $this.route[1]) ? $this.route[1] : '';
                setTimeout(() => {
                    $('.side-menu .side-menu-items > ul.dropdown-list').niceScroll({
                        cursorcolor: "rgba(0,0,0,0.35)",
                        cursorborder: "0px",
                        cursorwidth: "3px",
                    });
                    $('.side-menu .side-menu-items > ul.dropdown-list > li, .side-menu ul.mobile-modules-menu-list > li', document).each(function () {
                        let li = $(this);
                        if (li.hasClass('active')) {
                            li.find('>ul').slideDown(300);
                            setTimeout(() => {
                                if (li.offset().top > $('.side-menu .side-menu-items > ul.dropdown-list').height()) {
                                    $('.side-menu .side-menu-items > ul.dropdown-list').getNiceScroll(0).doScrollTop(li.offset().top, 300);
                                    $('.side-menu .side-menu-items > ul.dropdown-list').getNiceScroll().resize();
                                }
                            }, 500);
                        }

                        $('>ul>li>a', li).on('click', function (event) {
                            $(this).parent().parent().find('>li').removeClass('active');
                            $(this).parent().addClass('active');
                        });

                        $('>ul>li>a', li).parent().removeClass('active');

                        $('.side-menu .side-menu-items > ul.dropdown-list > li.active, .side-menu ul.mobile-modules-menu-list > li.active').each(function () {
                            if (!$('>ul>li>a[data-label="' + $this.current_doctype + '"]', this).length) {
                                $(this).removeClass('active hide-sub-menu').find('>ul').hide();
                            }
                        });

                        $('>ul>li>a[data-label="' + $this.current_doctype + '"]', li).each(function () {
                            if (!$(this).parent().hasClass('active')) {
                                $('>ul>li>a[data-label="' + $this.current_doctype + '"]', li).parent().addClass('active');
                            }
                            if (!$(this).parent().parent().parent().hasClass('active')) {
                                $(this).parent().parent().parent().addClass('active').find('>ul').slideDown();
                            }
                        });

                    });
                }, 500);
                setTimeout(() => {
                    let current_dashboard_link = $('.side-menu ul.mobile-modules-menu-list > li > a[data-dashboard="' + $this.current_doctype + '"]', document);
                    current_dashboard_link.parent().addClass('active');
                }, 520);
            },
            get_theme_settings: function (callback) {
                const $this = this;
                if ($this.theme_settings && Object.keys($this.theme_settings).length) {
                    callback();
                } else {
                    frappe.call({
                        type: 'POST',
                        method: 'datavalue_theme.api.get_theme_settings',
                        args: {},
                        callback: function (response) {
                            $this.theme_settings = response.message;
                            callback();
                        }
                    });
                }
            },
            generate_route: function (link) {
                const opts = {
                    name: link.link_to,
                    type: link.link_type,
                    is_query_report: link.is_query_report
                };
                if (link.link_type == "Report" && !link.is_query_report) {
                    opts.doctype = link.dependencies;
                }
                const route = frappe.utils.generate_route(opts);
                return route;
            },
            open_module: function (module, is_mobile = false) {
                const $this = this;
                // frappe.set_route('/view-dashboard/' + (module).toLowerCase().replace(/ /g, "-").toLowerCase());
                $('.btn-open-modules').removeClass('active').find('i').removeClass().addClass('flaticon-menu');
                $('.modules-menu').fadeOut();
                if (is_mobile == false) {
                    frappe.set_route('/' + (module.replace(/ /g, "-")).toLowerCase());
                } else {
                    $this.is_shown_mobile_menu = true;
                }
                $this.module_menu_list(module);
            },
            open_dashboard: function (module) {
                frappe.set_route('/dashboard-view/' + (module));
            },
            mobile_back_modules: function () {
                const $this = this;
                $this.is_shown_mobile_menu = false;
            },
            get_module_icon(name, icon) {
                let module_icon = this.module_icon;
                if (module_icon[name] && (module_icon[name]).length) {
                    return module_icon[name];
                } else {
                    return icon;
                }
            },
            is_mobile: function () {
                let check = false;
                (function (a) {
                    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
                })(navigator.userAgent || navigator.vendor || window.opera);
                return check;
            }
        },
        created: function () {
            const $this = this;
            $this.route = frappe.get_route();
            $this.current_doctype = ($this.route && $this.route.length >= 2 && $this.route[1]) ? $this.route[1] : '';
            if ($('body').hasClass('frappe-rtl')) {
                $this.menu_items_animate = 'slideInRight';
            }
            $this.get_theme_settings(function () {
                $this.get_module_name_from_doctype();
            })
        }
    });

});