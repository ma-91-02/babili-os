'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/components/auth/AuthProvider';
import { t, getBrandName } from '../../../lib/i18n';
import type { SupportedLanguage } from '@babili/shared';
import styles from './restaurantSlug.module.scss';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

type Page = 'menu' | 'cart' | 'submitting' | 'order';

interface MenuItem {
  id: string;
  name: Record<string, string>;
  price: number;
  desc: Record<string, string>;
}

interface MenuSection {
  id: string;
  name: Record<string, string>;
  items: MenuItem[];
}

const demoMenuSections: MenuSection[] = [
  {
    id: '1',
    name: {
      ar: 'مقبلات',
      en: 'Appetizers',
      ru: 'Закуски',
      tr: 'Başlangıçlar',
      fr: 'Entrées',
      es: 'Entrantes',
      de: 'Vorspeisen',
      it: 'Antipasti',
      pt: 'Entradas',
      zh: '开胃菜',
      ja: '前菜',
      ko: '에피타이저',
      hi: 'क्षुधावर्धक',
      ur: 'بھوک بڑھانے والے',
      fa: 'پیش غذا',
      he: 'מתאבנים',
      id: 'Pembuka',
      ms: 'Pembuka',
      uk: 'Закуски',
      pl: 'Przystawki',
      nl: 'Voorgerechten',
      sv: 'Förrätter',
      el: 'Ορεκτικά',
      vi: 'Khai vị',
      th: 'อาหารเรียกน้ำย่อย',
    },
    items: [
      {
        id: 'i1',
        name: { ar: 'حمص', en: 'Hummus', ru: 'Хумус' },
        price: 25,
        desc: { ar: 'حمص مع طحينة', en: 'Chickpea with tahini', ru: 'Нут с тахини' },
      },
      {
        id: 'i2',
        name: { ar: 'متبل', en: 'Mutabbal', ru: 'Мутаббаль' },
        price: 28,
        desc: {
          ar: 'باذنجان مشوي مع طحينة',
          en: 'Grilled eggplant with tahini',
          ru: 'Жареный баклажан с тахини',
        },
      },
      {
        id: 'i3',
        name: { ar: 'ورق عنب', en: 'Stuffed Grape Leaves', ru: 'Долма' },
        price: 30,
        desc: {
          ar: 'ورق عنب بحشوة الأرز واللحم',
          en: 'Rice and meat stuffed grape leaves',
          ru: 'Виноградные листья с рисом и мясом',
        },
      },
    ],
  },
  {
    id: '2',
    name: {
      ar: 'الوجبات الرئيسية',
      en: 'Main Course',
      ru: 'Главные блюда',
      tr: 'Ana Yemekler',
      fr: 'Plats principaux',
      es: 'Platos principales',
      de: 'Hauptgerichte',
      it: 'Portate principali',
      pt: 'Pratos principais',
      zh: '主菜',
      ja: 'メインコース',
      ko: '메인 코스',
      hi: 'मुख्य भोजन',
      ur: 'مرکزی کورس',
      fa: 'غذای اصلی',
      he: 'מנה עיקרית',
      id: 'Menu Utama',
      ms: 'Hidangan Utama',
      uk: 'Основні страви',
      pl: 'Dania główne',
      nl: 'Hoofdgerechten',
      sv: 'Huvudrätter',
      el: 'Κύρια πιάτα',
      vi: 'Món chính',
      th: 'อาหารจานหลัก',
    },
    items: [
      {
        id: 'i4',
        name: { ar: 'كبسة لحم', en: 'Kabsa Meat', ru: 'Кабса с мясом' },
        price: 65,
        desc: {
          ar: 'أرز بسمتي مع لحم الضأن',
          en: 'Basmati rice with lamb',
          ru: 'Рис басмати с бараниной',
        },
      },
      {
        id: 'i5',
        name: { ar: 'مندي دجاج', en: 'Mandi Chicken', ru: 'Манди с курицей' },
        price: 55,
        desc: {
          ar: 'أرز مع دجاج مشوي',
          en: 'Rice with grilled chicken',
          ru: 'Рис с курицей-гриль',
        },
      },
      {
        id: 'i6',
        name: { ar: 'شاورما', en: 'Shawarma', ru: 'Шаурма' },
        price: 35,
        desc: {
          ar: 'شاورما لحم أو دجاج',
          en: 'Meat or chicken shawarma',
          ru: 'Шаурма с мясом или курицей',
        },
      },
      {
        id: 'i7',
        name: { ar: 'مشاوي مشكلة', en: 'Mixed Grill', ru: 'Смешанный гриль' },
        price: 75,
        desc: {
          ar: 'تشكيلة مشاوي لحم ودجاج',
          en: 'Assorted meat and chicken grill',
          ru: 'Ассорти из мяса и курицы-гриль',
        },
      },
    ],
  },
  {
    id: '3',
    name: {
      ar: 'الحلويات',
      en: 'Desserts',
      ru: 'Десерты',
      tr: 'Tatlılar',
      fr: 'Desserts',
      es: 'Postres',
      de: 'Nachspeisen',
      it: 'Dolci',
      pt: 'Sobremesas',
      zh: '甜点',
      ja: 'デザート',
      ko: '디저트',
      hi: 'मिठाई',
      ur: 'میٹھے',
      fa: 'دسر',
      he: 'קינוחים',
      id: 'Makanan Penutup',
      ms: 'Pencuci Mulut',
      uk: 'Десерти',
      pl: 'Desery',
      nl: 'Nagerechten',
      sv: 'Efterrätter',
      el: 'Επιδόρπια',
      vi: 'Tráng miệng',
      th: 'ของหวาน',
    },
    items: [
      {
        id: 'i8',
        name: { ar: 'كنافة', en: 'Kunafa', ru: 'Кунафа' },
        price: 25,
        desc: { ar: 'كنافة بالجبن', en: 'Cheese kunafa', ru: 'Сырная кунафа' },
      },
      {
        id: 'i9',
        name: { ar: 'أم علي', en: 'Om Ali', ru: 'Ом Али' },
        price: 22,
        desc: {
          ar: 'حلوى مصرية تقليدية',
          en: 'Traditional Egyptian dessert',
          ru: 'Традиционный египетский десерт',
        },
      },
      {
        id: 'i10',
        name: { ar: 'بقلاوة', en: 'Baklava', ru: 'Пахлава' },
        price: 28,
        desc: { ar: 'بقلاوة بالفستق', en: 'Pistachio baklava', ru: 'Фисташковая пахлава' },
      },
    ],
  },
  {
    id: '4',
    name: {
      ar: 'المشروبات',
      en: 'Beverages',
      ru: 'Напитки',
      tr: 'İçecekler',
      fr: 'Boissons',
      es: 'Bebidas',
      de: 'Getränke',
      it: 'Bevande',
      pt: 'Bebidas',
      zh: '饮料',
      ja: '飲み物',
      ko: '음료',
      hi: 'पेय',
      ur: 'مشروبات',
      fa: 'نوشیدنی',
      he: 'משקאות',
      id: 'Minuman',
      ms: 'Minuman',
      uk: 'Напої',
      pl: 'Napoje',
      nl: 'Dranken',
      sv: 'Drycker',
      el: 'Ποτά',
      vi: 'Đồ uống',
      th: 'เครื่องดื่ม',
    },
    items: [
      {
        id: 'i11',
        name: { ar: 'شاي', en: 'Tea', ru: 'Чай' },
        price: 10,
        desc: { ar: 'شاي ساخن', en: 'Hot tea', ru: 'Горячий чай' },
      },
      {
        id: 'i12',
        name: { ar: 'قهوة عربية', en: 'Arabic Coffee', ru: 'Арабский кофе' },
        price: 15,
        desc: {
          ar: 'قهوة عربية مع هيل',
          en: 'Arabic coffee with cardamom',
          ru: 'Арабский кофе с кардамоном',
        },
      },
      {
        id: 'i13',
        name: { ar: 'عصير برتقال', en: 'Orange Juice', ru: 'Апельсиновый сок' },
        price: 18,
        desc: {
          ar: 'عصير برتقال طبيعي',
          en: 'Fresh orange juice',
          ru: 'Свежевыжатый апельсиновый сок',
        },
      },
      {
        id: 'i14',
        name: { ar: 'مياه معدنية', en: 'Mineral Water', ru: 'Минеральная вода' },
        price: 5,
        desc: { ar: 'مياه معدنية 500 مل', en: 'Mineral water 500ml', ru: 'Минеральная вода 500мл' },
      },
    ],
  },
];

function getLocalized(dict: Record<string, string>, lang: string): string {
  return dict[lang] || dict.en || '';
}

function CartView({
  lang,
  cart,
  setCart,
  setPage,
  submitting,
  onSubmitOrder,
}: {
  lang: SupportedLanguage;
  cart: CartItem[];
  setCart: (items: CartItem[]) => void;
  setPage: (page: Page) => void;
  submitting: boolean;
  onSubmitOrder: () => void;
}) {
  const total = cart.reduce((sum, ci) => sum + ci.price * ci.quantity, 0);

  const updateQty = (id: string, delta: number) => {
    setCart(
      cart
        .map((ci: CartItem) =>
          ci.id === id ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci,
        )
        .filter((ci: CartItem) => ci.quantity > 0),
    );
  };

  return (
    <div className={styles.cartPage}>
      <header className={styles.cartHeader}>
        <button className="btn btn-ghost" onClick={() => setPage('menu')}>
          ← {t('nav.menu', lang)}
        </button>
        <h1>{t('nav.orders', lang)}</h1>
      </header>

      <div className={styles.cartItems}>
        {cart.length === 0 ? (
          <div className="card">
            <p>{t('common.loading', lang)}</p>
          </div>
        ) : (
          cart.map((ci) => (
            <div key={ci.id} className={styles.cartItem}>
              <div>
                <h3>{ci.name}</h3>
                <span className={styles.itemPrice}>{ci.price}</span>
              </div>
              <div className={styles.qtyControl}>
                <button className="btn btn-ghost btn-sm" onClick={() => updateQty(ci.id, -1)}>
                  −
                </button>
                <span>{ci.quantity}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => updateQty(ci.id, 1)}>
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className={styles.cartFooter}>
          <div className={styles.total}>
            <span>{t('nav.orders', lang)}:</span>
            <strong>{total}</strong>
          </div>
          <button className="btn btn-primary" onClick={onSubmitOrder} disabled={submitting}>
            {submitting ? t('common.loading', lang) : t('common.confirm', lang)}
          </button>
        </div>
      )}
    </div>
  );
}

function OrderView({
  lang,
  orderResult,
  setPage,
}: {
  lang: SupportedLanguage;
  orderResult: { success: boolean; orderId?: string; error?: string } | null;
  setPage: (page: Page) => void;
}) {
  return (
    <div className={styles.orderPage}>
      <div className={styles.orderSuccess}>
        {orderResult?.success ? (
          <>
            <div className={styles.checkMark}>✓</div>
            <h1>{t('nav.orders', lang)}</h1>
            {orderResult.orderId && (
              <p className={styles.orderId}>#{orderResult.orderId.slice(0, 8)}</p>
            )}
            <p>{t('common.loading', lang)}</p>
          </>
        ) : (
          <>
            <div className={styles.errorMark}>✕</div>
            <h1>{t('common.error', lang)}</h1>
            <p>{orderResult?.error || t('common.error', lang)}</p>
          </>
        )}
        <button className="btn btn-primary" onClick={() => setPage('menu')}>
          {t('nav.menu', lang)}
        </button>
      </div>
    </div>
  );
}

function SubmittingView({ lang }: { lang: SupportedLanguage }) {
  return (
    <div className={styles.orderPage}>
      <div className={styles.orderSuccess}>
        <div className={styles.spinner} />
        <h1>{t('common.loading', lang)}</h1>
        <p>{t('nav.orders', lang)}</p>
      </div>
    </div>
  );
}

export default function RestaurantSlugPage({
  params,
}: {
  params: Promise<{ restaurantSlug: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{ restaurantSlug: string } | null>(null);
  const [page, setPage] = useState<Page>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    success: boolean;
    orderId?: string;
    error?: string;
  } | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { lang } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const restaurantSlug = resolvedParams?.restaurantSlug || '';

  useEffect(() => {
    if (!restaurantSlug) return;
    fetch(`/api/restaurants/slug/${restaurantSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.id) {
          setRestaurantId(data.data.id);
        }
      })
      .catch(() => {});
  }, [restaurantSlug]);

  const restaurantName = restaurantSlug.replace(/-/g, ' ') || 'Restaurant';

  const addToCart = (item: { id: string; menuItemId: string; name: string; price: number }) => {
    setCart((prev: CartItem[]) => {
      const existing = prev.find((ci: CartItem) => ci.id === item.id);
      if (existing) {
        return prev.map((ci: CartItem) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { ...item, quantity: 1, notes: '' }];
    });
  };

  const submitOrder = useCallback(async () => {
    if (!user) {
      router.push(`/login?redirect=/r/${restaurantSlug}`);
      return;
    }
    if (!restaurantId || cart.length === 0) return;

    setSubmitting(true);
    setPage('submitting');

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableId: null,
          items: cart.map((ci) => ({
            menuItemId: ci.menuItemId,
            name: ci.name,
            quantity: ci.quantity,
            price: ci.price,
            notes: ci.notes || undefined,
          })),
          language: lang,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderResult({ success: true, orderId: data.data?.id });
        setCart([]);
      } else {
        setOrderResult({ success: false, error: data.error || t('common.error', lang) });
      }
    } catch {
      setOrderResult({ success: false, error: t('common.error', lang) });
    } finally {
      setSubmitting(false);
      setPage('order');
    }
  }, [user, restaurantId, cart, lang, router, restaurantSlug]);

  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  if (page === 'cart') {
    return (
      <div className={styles.page}>
        <CartView
          lang={lang}
          cart={cart}
          setCart={setCart}
          setPage={setPage}
          submitting={submitting}
          onSubmitOrder={submitOrder}
        />
      </div>
    );
  }

  if (page === 'submitting') {
    return (
      <div className={styles.page}>
        <SubmittingView lang={lang} />
      </div>
    );
  }

  if (page === 'order') {
    return (
      <div className={styles.page}>
        <OrderView lang={lang} orderResult={orderResult} setPage={setPage} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>{getBrandName(lang)}</div>
        <LanguageSelector className={styles.langSelect} />
      </header>

      <main className={styles.content}>
        <div className={styles.restaurantInfo}>
          <h1>{restaurantName}</h1>
        </div>

        <div className={styles.sections}>
          {demoMenuSections.map((section) => (
            <div key={section.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>{getLocalized(section.name, lang)}</h2>
              <div className={styles.items}>
                {section.items.map((item) => (
                  <div key={item.id} className={styles.menuItem}>
                    <div className={styles.itemInfo}>
                      <h3>{getLocalized(item.name, lang)}</h3>
                      <p className={styles.itemDesc}>{getLocalized(item.desc, lang)}</p>
                      <span className={styles.itemPrice}>{item.price}</span>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          menuItemId: item.id,
                          name: getLocalized(item.name, lang),
                          price: item.price,
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {totalItems > 0 && (
          <div className={styles.cartBar}>
            <button className="btn btn-primary" onClick={() => setPage('cart')}>
              {t('nav.orders', lang)} ({totalItems})
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
