// i18n - Internationalization
export class I18n {
    constructor() {
        this.locale = localStorage.getItem('locale') || 'en';
        this.translations = {
            en: {
                'title': 'Eco-taxi by Parki ar minda',
                'subtitle': 'Please, fill this form if you want to order eco-taxi',
                'button.login': 'Login',
                'button.logout': 'Logout',
                'welcome': 'Welcome',
                'details': 'Please check your details',
                'orders': 'Orders History',
                'date': 'Date',
                'date.check1': 'Monday 9:00-11:00',
                'date.check2': 'Wednesday 9:00-11:00',
                'date.check3': 'Thursday 16:00-18:00',
                'date.check4': 'Friday 16:00-18:00',
                'area': 'Area',
                'area.placeholder': 'Select area',
                'address': 'Address',
                'address.placeholder': 'Enter your address',
                'email': 'Email',
                'phone': 'Phone',
                'quantity': 'Quantity',
                'tariff': 'Tariff',
                'payment': 'Payment',
                'payment.cash': 'Cash',
                'payment.transfer': 'Transfer to account',
                'payment.invoice': 'Invoice',
                'files': 'Photos (optional)',
                'comment': 'Comment',
                'submit': 'Submit Order',
                'uploading': 'Uploading files...',
                'success.title': 'Order Submitted Successfully!',
                'success.text': 'We will contact you soon.',
                'error.required': 'Please fill all required fields',
                'error.date': 'Please select at least one date'
            },
            ka: {
                'title': 'ეკო-ტაქსი Parki ar minda-სგან',
                'subtitle': 'გთხოვთ შეავსოთ ფორმა ეკო-ტაქსის შესაკვეთად',
                'button.login': 'შესვლა',
                'button.logout': 'გამოსვლა',
                'welcome': 'კეთილი იყოს თქვენი მობრძანება',
                'details': 'გთხოვთ შეამოწმოთ თქვენი მონაცემები',
                'orders': 'შეკვეთების ისტორია',
                'date': 'თარიღი',
                'date.check1': 'ორშაბათი 9:00-11:00',
                'date.check2': 'ოთხშაბათი 9:00-11:00',
                'date.check3': 'ხუთშაბათი 16:00-18:00',
                'date.check4': 'პარასკევი 16:00-18:00',
                'area': 'უბანი',
                'area.placeholder': 'აირჩიეთ უბანი',
                'address': 'მისამართი',
                'address.placeholder': 'შეიყვანეთ თქვენი მისამართი',
                'email': 'ელფოსტა',
                'phone': 'ტელეფონი',
                'quantity': 'რაოდენობა',
                'tariff': 'ტარიფი',
                'payment': 'გადახდა',
                'payment.cash': 'ნაღდი',
                'payment.transfer': 'გადარიცხვა',
                'payment.invoice': 'ინვოისი',
                'files': 'ფოტოები (არასავალდებულო)',
                'comment': 'კომენტარი',
                'submit': 'შეკვეთის გაგზავნა',
                'uploading': 'ფაილების ატვირთვა...',
                'success.title': 'შეკვეთა წარმატებით გაიგზავნა!',
                'success.text': 'მალე დაგიკავშირდებით.',
                'error.required': 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი',
                'error.date': 'გთხოვთ აირჩიოთ მინიმუმ ერთი თარიღი'
            }
        };
    }

    t(key) {
        return this.translations[this.locale]?.[key] || key;
    }

    setLocale(locale) {
        this.locale = locale;
        localStorage.setItem('locale', locale);
        this.updateDOM();
    }

    updateDOM() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    }

    init() {
        this.updateDOM();
    }
}
