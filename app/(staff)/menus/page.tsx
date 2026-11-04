"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/ToastProvider";
import { KANTIN_DATA } from "@/lib/data";
import { useLanguage } from "@/lib/i18n";

type OptionRow = { name: string; choices: string };

const slugify = (value: string, fallback = "item") =>
  String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;

export default function MenusPage() {
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [categories, setCategories] = useState<any[]>(() => KANTIN_DATA.categories);
  const [menus, setMenus] = useState<any[]>(() => KANTIN_DATA.menu);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameId, setNameId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descId, setDescId] = useState("");
  const [descEn, setDescEn] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState("/assets/menu/placeholder.webp");
  const [optionRows, setOptionRows] = useState<OptionRow[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryNameId, setCategoryNameId] = useState("");
  const [categoryNameEn, setCategoryNameEn] = useState("");

  useEffect(() => {
    document.title = "Menu & kategori · Kantin Mini";
  }, [lang]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", menuOpen || categoryOpen);
    return () => document.body.classList.remove("modal-open");
  }, [menuOpen, categoryOpen]);

  const syncMenus = (next: any[]) => {
    KANTIN_DATA.menu.splice(0, KANTIN_DATA.menu.length, ...next);
    setMenus([...next]);
  };

  const syncCategories = (next: any[]) => {
    KANTIN_DATA.categories.splice(0, KANTIN_DATA.categories.length, ...next);
    setCategories([...next]);
  };

  const categoryName = (category: any) => KANTIN_DATA.localized(category.name, lang);
  const menuName = (menu: any) => KANTIN_DATA.localized(menu.name, lang);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return menus.filter((menu) => {
      if (activeCategory !== "all" && menu.category !== activeCategory) return false;
      if (!query) return true;
      return `${menuName(menu)} ${KANTIN_DATA.localized(menu.desc, lang)}`.toLowerCase().includes(query);
    });
  }, [menus, activeCategory, search, lang]);

  const countMenus = (id: string) => menus.filter((menu) => id === "all" || menu.category === id).length;

  const openMenu = (menuId: string | null) => {
    const menu = menuId ? menus.find((entry) => entry.id === menuId) : null;
    setEditingId(menuId);
    setNameId(menu ? menu.name.id : "");
    setNameEn(menu ? menu.name.en : "");
    setDescId(menu ? menu.desc.id : "");
    setDescEn(menu ? menu.desc.en : "");
    setPrice(menu ? String(menu.price) : "");
    setCategoryId(menu ? menu.category : activeCategory !== "all" ? activeCategory : categories[0]?.id || "");
    setPhoto(null);
    setPhotoPreview(menu ? menu.image : "/assets/menu/placeholder.webp");
    setOptionRows(
      menu
        ? menu.options.map((group: any) => ({
            name: group.label.id,
            choices: group.choices.map((choice: any) => choice.label.id).join(", "),
          }))
        : [],
    );
    setMenuOpen(true);
  };

  const openCategory = (id: string | null) => {
    const category = id ? categories.find((entry) => entry.id === id) : null;
    setEditingCategoryId(id);
    setCategoryNameId(category ? category.name.id : "");
    setCategoryNameEn(category ? category.name.en : "");
    setCategoryOpen(true);
  };

  const saveMenu = (event: FormEvent) => {
    event.preventDefault();
    if (!nameId.trim() || !Number.isFinite(Number(price))) return;
    const existing = editingId ? menus.find((entry) => entry.id === editingId) : null;
    const optionGroups = optionRows
      .map((row) => {
        const label = row.name.trim();
        const choices = row.choices.split(",").map((choice) => choice.trim()).filter(Boolean);
        if (!label || !choices.length) return null;
        return {
          id: slugify(label, "opsi"),
          label: { id: label, en: label },
          required: true,
          choices: choices.map((choice) => ({
            id: slugify(choice, "pilihan"),
            label: { id: choice, en: choice },
          })),
        };
      })
      .filter(Boolean);
    const menu = {
      id: existing ? existing.id : `${slugify(nameEn || nameId, "menu")}-${Date.now()}`,
      category: categoryId,
      name: { id: nameId.trim(), en: nameEn.trim() || nameId.trim() },
      desc: { id: descId.trim(), en: descEn.trim() || descId.trim() },
      price: Number(price),
      image: photo || (existing ? existing.image : "/assets/menu/placeholder.webp"),
      available: existing ? existing.available : true,
      popular: existing ? existing.popular : false,
      options: optionGroups,
    };
    const next = existing
      ? menus.map((entry) => (entry.id === existing.id ? menu : entry))
      : [menu, ...menus];
    syncMenus(next);
    setActiveCategory(menu.category);
    setMenuOpen(false);
    toast(t("menus.menuSaved"));
  };

  const saveCategory = (event: FormEvent) => {
    event.preventDefault();
    if (!categoryNameId.trim()) return;
    const existing = editingCategoryId ? categories.find((entry) => entry.id === editingCategoryId) : null;
    const category = {
      id: existing ? existing.id : `${slugify(categoryNameEn || categoryNameId, "kategori")}-${Date.now()}`,
      name: { id: categoryNameId.trim(), en: categoryNameEn.trim() || categoryNameId.trim() },
      icon: existing ? existing.icon : "utensils",
    };
    const next = existing
      ? categories.map((entry) => (entry.id === existing.id ? category : entry))
      : [...categories, category];
    syncCategories(next);
    setActiveCategory(category.id);
    setCategoryOpen(false);
    toast(t("menus.categorySaved"));
  };

  const moveMenu = (id: string, direction: number) => {
    const index = visible.findIndex((menu) => menu.id === id);
    const swap = index + direction;
    if (index < 0 || swap < 0 || swap >= visible.length) return;
    const first = menus.findIndex((menu) => menu.id === visible[index].id);
    const second = menus.findIndex((menu) => menu.id === visible[swap].id);
    const next = [...menus];
    [next[first], next[second]] = [next[second], next[first]];
    syncMenus(next);
  };

  const moveCategory = (id: string, direction: number) => {
    const index = categories.findIndex((category) => category.id === id);
    const swap = index + direction;
    if (index < 0 || swap < 0 || swap >= categories.length) return;
    const next = [...categories];
    [next[index], next[swap]] = [next[swap], next[index]];
    syncCategories(next);
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2>{t("menus.heading")}</h2>
          <p className="page-subtitle">{t("menus.subtitle")}</p>
        </div>
        <button className="btn btn-primary btn-sm" type="button" onClick={() => openMenu(null)}>
          <Icon name="plus" /><span>{t("action.addMenu")}</span>
        </button>
      </div>

      <div className="menu-admin-layout">
        <section className="panel category-panel">
          <div className="panel-head">
            <h3 className="panel-title"><Icon name="tag" /><span>{t("menus.categories")}</span></h3>
            <button className="icon-btn" type="button" aria-label={t("action.addCategory")} onClick={() => openCategory(null)}>
              <Icon name="plus" />
            </button>
          </div>
          <ul className="category-list">
            <li className={`category-item ${activeCategory === "all" ? "is-active" : ""}`} onClick={() => setActiveCategory("all")}>
              <span>{t("label.all")} <span className="cell-muted">{countMenus("all")}</span></span>
            </li>
            {categories.map((category) => (
              <li className={`category-item ${activeCategory === category.id ? "is-active" : ""}`} key={category.id} onClick={() => setActiveCategory(category.id)}>
                <span>{categoryName(category)} <span className="cell-muted">{countMenus(category.id)}</span></span>
                <span className="page-actions" style={{ gap: 0 }}>
                  <button type="button" aria-label={t("action.moveUp")} onClick={(event) => { event.stopPropagation(); moveCategory(category.id, -1); }}><Icon name="chevron-up" /></button>
                  <button type="button" aria-label={t("action.moveDown")} onClick={(event) => { event.stopPropagation(); moveCategory(category.id, 1); }}><Icon name="chevron-down" /></button>
                  <button type="button" aria-label={t("action.edit")} onClick={(event) => { event.stopPropagation(); openCategory(category.id); }}><Icon name="edit" /></button>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel menu-admin-panel">
          <div className="menu-admin-toolbar">
            <div className="input-with-icon">
              <Icon name="search" />
              <input className="input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("menus.searchPlaceholder")} />
            </div>
            <span className="cell-muted">{t("menus.menuCount", { count: visible.length })}</span>
          </div>
          <div className="menu-admin-list">
            {visible.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon"><Icon name="utensils" /></span>
                <h3>{t("menus.empty")}</h3>
              </div>
            ) : visible.map((menu) => {
              const category = categories.find((entry) => entry.id === menu.category);
              return (
                <div className="menu-admin-row" key={menu.id}>
                  <span className="menu-drag" aria-hidden="true"><Icon name="grip" /></span>
                  <span className="menu-thumb"><img src={menu.image} alt="" width={800} height={800} decoding="async" /></span>
                  <div className="menu-admin-info">
                    <h3>{menuName(menu)}</h3>
                    <p>{category ? categoryName(category) : ""} · {menu.options.length ? `${t("label.options")}: ${menu.options.length}` : t("menus.noOptions")}</p>
                    <span className={`badge ${menu.available ? "badge-paid" : "badge-expired"}`} style={{ marginTop: 5 }}>{menu.available ? t("label.available") : t("label.soldOut")}</span>
                  </div>
                  <span className="menu-admin-price">{KANTIN_DATA.formatIDR(menu.price)}</span>
                  <label className="switch" title={t("label.available")}>
                    <input
                      type="checkbox"
                      checked={menu.available}
                      onChange={(event) => {
                        const next = menus.map((entry) => entry.id === menu.id ? { ...entry, available: event.target.checked } : entry);
                        syncMenus(next);
                        toast(t("menus.availabilityUpdated"));
                      }}
                    />
                    <span className="switch-track" />
                  </label>
                  <div className="menu-admin-actions">
                    <div className="order-pair">
                      <button className="icon-btn" type="button" aria-label={t("action.moveUp")} onClick={() => moveMenu(menu.id, -1)}><Icon name="chevron-up" /></button>
                      <button className="icon-btn" type="button" aria-label={t("action.moveDown")} onClick={() => moveMenu(menu.id, 1)}><Icon name="chevron-down" /></button>
                    </div>
                    <button className="icon-btn" type="button" aria-label={t("action.edit")} onClick={() => openMenu(menu.id)}><Icon name="edit" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {menuOpen ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="menu-modal-title">
          <div className="modal-card modal-card-wide">
            <div className="modal-head">
              <div>
                <h2 id="menu-modal-title">{editingId ? t("menus.editMenu") : t("menus.newMenu")}</h2>
                <p>{t("menus.formDesc")}</p>
              </div>
              <button className="icon-btn" type="button" aria-label={t("action.close")} onClick={() => setMenuOpen(false)}><Icon name="x" /></button>
            </div>
            <form onSubmit={saveMenu}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="menu-name-id">{t("menus.nameId")}</label>
                    <input className="input" id="menu-name-id" value={nameId} onChange={(event) => setNameId(event.target.value)} required maxLength={80} />
                  </div>
                  <div className="field">
                    <label htmlFor="menu-name-en">{t("menus.nameEn")}</label>
                    <input className="input" id="menu-name-en" value={nameEn} onChange={(event) => setNameEn(event.target.value)} maxLength={80} />
                  </div>
                  <div className="field">
                    <label htmlFor="menu-desc-id">{t("menus.descId")}</label>
                    <textarea className="textarea" id="menu-desc-id" value={descId} onChange={(event) => setDescId(event.target.value)} maxLength={200} />
                  </div>
                  <div className="field">
                    <label htmlFor="menu-desc-en">{t("menus.descEn")}</label>
                    <textarea className="textarea" id="menu-desc-en" value={descEn} onChange={(event) => setDescEn(event.target.value)} maxLength={200} />
                  </div>
                  <div className="field">
                    <label htmlFor="menu-price">{t("menus.price")}</label>
                    <input className="input" id="menu-price" type="number" min={0} step={500} value={price} onChange={(event) => setPrice(event.target.value)} required />
                  </div>
                  <div className="field">
                    <label htmlFor="menu-category">{t("menus.category")}</label>
                    <select className="select" id="menu-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                      {categories.map((category) => <option value={category.id} key={category.id}>{categoryName(category)}</option>)}
                    </select>
                  </div>
                  <div className="field field-full">
                    <span className="field-label">{t("menus.photo")}</span>
                    <label className="photo-drop" htmlFor="menu-photo">
                      <img src={photoPreview} alt="" />
                      <span className="photo-drop-copy"><strong>{t("menus.photo")}</strong><small>{t("menus.photoHint")}</small></span>
                      <span className="btn btn-sm btn-outline">{t("menus.choosePhoto")}</span>
                      <input
                        id="menu-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const url = URL.createObjectURL(file);
                          setPhoto(url);
                          setPhotoPreview(url);
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="sheet-section" style={{ marginTop: 20, paddingTop: 18, borderTop: "1px dashed var(--line)" }}>
                  <div className="panel-head" style={{ padding: "0 0 10px", border: 0 }}>
                    <div>
                      <h3 className="panel-title"><Icon name="utensils" /><span>{t("menus.optionsTitle")}</span></h3>
                      <p className="panel-subtitle">{t("menus.optionsHint")}</p>
                    </div>
                    <button className="btn btn-sm btn-outline" type="button" onClick={() => setOptionRows((current) => [...current, { name: "", choices: "" }])}>
                      <Icon name="plus" /><span>{t("menus.addOption")}</span>
                    </button>
                  </div>
                  <div className="option-builder">
                    {optionRows.map((row, index) => (
                      <div className="option-row" key={index}>
                        <div className="field">
                          <label>{t("menus.optionName")}</label>
                          <input className="input" value={row.name} onChange={(event) => setOptionRows((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: event.target.value } : entry))} placeholder="Saus" />
                        </div>
                        <div className="field">
                          <label>{t("menus.choices")}</label>
                          <input className="input" value={row.choices} onChange={(event) => setOptionRows((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, choices: event.target.value } : entry))} placeholder="Sambal bawang, Sambal matah" />
                        </div>
                        <button className="option-remove" type="button" aria-label={t("menus.removeGroup")} onClick={() => setOptionRows((current) => current.filter((_, entryIndex) => entryIndex !== index))}><Icon name="trash" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button className="btn btn-outline" type="button" onClick={() => setMenuOpen(false)}>{t("action.cancel")}</button>
                <button className="btn btn-primary" type="submit">{t("menus.saveMenu")}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {categoryOpen ? (
        <div className="modal is-open" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
          <div className="modal-card">
            <div className="modal-head">
              <div>
                <h2 id="category-modal-title">{editingCategoryId ? t("menus.editCategory") : t("menus.newCategory")}</h2>
                <p>{t("menus.categories")}</p>
              </div>
              <button className="icon-btn" type="button" aria-label={t("action.close")} onClick={() => setCategoryOpen(false)}><Icon name="x" /></button>
            </div>
            <form onSubmit={saveCategory}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="category-name-id">{t("menus.nameId")}</label>
                    <input className="input" id="category-name-id" value={categoryNameId} onChange={(event) => setCategoryNameId(event.target.value)} required maxLength={50} />
                  </div>
                  <div className="field">
                    <label htmlFor="category-name-en">{t("menus.nameEn")}</label>
                    <input className="input" id="category-name-en" value={categoryNameEn} onChange={(event) => setCategoryNameEn(event.target.value)} maxLength={50} />
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button className="btn btn-outline" type="button" onClick={() => setCategoryOpen(false)}>{t("action.cancel")}</button>
                <button className="btn btn-primary" type="submit">{t("menus.saveCategory")}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
