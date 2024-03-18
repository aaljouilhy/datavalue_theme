from __future__ import unicode_literals
import frappe


@frappe.whitelist()
def get_module_name_from_doctype(doc_name, current_module=""):
    # frappe.msgprint("======"+str(doc_name))
    condition = ""
    if doc_name:
        if current_module:
            condition = "and  w.`name` = {current_module} ".format(current_module=current_module)

        list_od_dicts = frappe.db.sql("""
            select *
                    from (
                            select  w.`name` `module`,
                                 (select restrict_to_domain from `tabModule Def` where `name` = w.module ) restrict_to_domain
                                             from  tabWorkspace w
                                             inner join
                                                        `tabWorkspace Link` l
                                                        on w.`name` = l.parent
                                                         where link_to = '{doc_name}'
                                                          %s
                                )	T
        """.format(doc_name=doc_name), (condition), as_dict=True, debug=False)
        if list_od_dicts:
            return [{"module": list_od_dicts[0]["module"]}]
        else:
            list_od_dicts = frappe.db.sql("""
                select *
                        from (
                                select  w.`name` `module`,
                                     (select restrict_to_domain from `tabModule Def` where `name` = w.module ) restrict_to_domain
                                                 from  tabWorkspace w
                                                 inner join
                                                            `tabWorkspace Link` l
                                                            on w.`name` = l.parent
                                                             where link_to = '{doc_name}'
                                    )	T
            """.format(doc_name=doc_name), as_dict=True, debug=False)
        if list_od_dicts:
            return [{"module": list_od_dicts[0]["module"]}]


@frappe.whitelist()
def change_language(language):
    frappe.db.set_value("User", frappe.session.user, "language", language)
    return True


@frappe.whitelist()
def get_company_logo():
    logo_path = ""
    current_company = frappe.defaults.get_user_default("company")
    if current_company:
        logo_path = frappe.db.get_value("Company", current_company, "company_logo")

    return logo_path


@frappe.whitelist(allow_guest=True)
def get_theme_settings():
    slideshow_photos = []
    list = {}
    settings = frappe.db.sql("""
                       SELECT * FROM tabSingles WHERE doctype = 'Theme Settings';
    """, as_dict=True, debug=False)

    for setting in settings:
        list[setting['field']] = setting['value']

    if (list['background_type'] == 'Slideshow'):
        slideshow_photos = frappe.db.sql("""
                               SELECT `photo` FROM `tabSlideshow Photos` WHERE `parent` = 'Theme Settings';
            """, as_dict=True, debug=False)

    return {
        'enable_background': list['enable_background'],
        'background_photo': list['background_photo'],
        'background_type': list['background_type'],
        'full_page_background': list['full_page_background'],
        'transparent_background': list['transparent_background'],
        'slideshow_photos': slideshow_photos,
        'dark_view': list['dark_view'],
        'theme_color': list['theme_color'],
        'show_icon_label': list['show_icon_label'],
        'hide_icon_tooltip': list['hide_icon_tooltip']
    }
