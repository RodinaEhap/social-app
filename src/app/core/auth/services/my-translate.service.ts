import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MyTranslateService {
  private translateService = inject(TranslateService);
  constructor() {
    this.translateService.addLangs(['en', 'ar']);
    const savedLang = localStorage.getItem('lang') || 'en';
    this.changeLang(savedLang);
  }
  changeLang(lang: string) {
    localStorage.setItem('lang', lang);
    this.translateService.use(lang);
    this.changeDirection(lang);
  }
  private changeDirection(lang: string) {
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }
}
