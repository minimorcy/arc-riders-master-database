export type LanguageCode = 'es' | 'en' | 'de' | 'fr' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh';

export interface Language {
    code: LanguageCode;
    label: string;
    flag: string;
}

export const LANGUAGES: Language[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
    es: {
        "nav.items": "Objetos",
        "nav.quests": "Misiones",
        "nav.workshop": "Taller",
        "nav.hideout": "Escondite",
        "search.placeholder": "Buscar objetos...",
        "sort.name": "Nombre",
        "sort.rarity": "Rareza",
        "sort.value": "Valor",
        "cat.all": "Todos",
        "cat.priority": "Prioridad",
        "cat.quests": "Misión",
        "cat.safe": "Safe to Sell",
        "cat.workshop": "Taller",
        "cat.expedition": "Expedición",
        "quest.status.active": "Misión (Requerido)",
        "quest.status.completed": "Misión (Completada)",
        "quest.mark.pending": "Marcar como pendiente",
        "quest.mark.completed": "Marcar como completada",
    },
    en: {
        "nav.items": "Items",
        "nav.quests": "Quests",
        "nav.workshop": "Workshop",
        "nav.hideout": "Hideout",
        "search.placeholder": "Search items...",
        "sort.name": "Name",
        "sort.rarity": "Rarity",
        "sort.value": "Value",
        "cat.all": "All",
        "cat.priority": "Priority",
        "cat.quests": "Quest",
        "cat.safe": "Safe to Sell",
        "cat.workshop": "Workshop",
        "cat.expedition": "Expedition",
        "quest.status.active": "Quest (Required)",
        "quest.status.completed": "Quest (Completed)",
        "quest.mark.pending": "Mark as pending",
        "quest.mark.completed": "Mark as completed",
    },
    de: { "nav.items": "Gegenstände", "nav.quests": "Quests", "nav.workshop": "Werkstatt", "nav.hideout": "Versteck", "search.placeholder": "Suche...", "sort.name": "Name", "sort.rarity": "Seltenheit", "sort.value": "Wert", "cat.all": "Alle", "cat.priority": "Priorität", "cat.quests": "Quest", "cat.safe": "Verkaufen", "cat.workshop": "Werkstatt", "cat.expedition": "Expedition" },
    fr: { "nav.items": "Objets", "nav.quests": "Quêtes", "nav.workshop": "Atelier", "nav.hideout": "Planque", "search.placeholder": "Rechercher...", "sort.name": "Nom", "sort.rarity": "Rareté", "sort.value": "Valeur", "cat.all": "Tous", "cat.priority": "Priorité", "cat.quests": "Quête", "cat.safe": "À vendre", "cat.workshop": "Atelier", "cat.expedition": "Expédition" },
    it: { "nav.items": "Oggetti", "nav.quests": "Missioni", "nav.workshop": "Officina", "nav.hideout": "Rifugio", "search.placeholder": "Cerca...", "sort.name": "Nome", "sort.rarity": "Rarità", "sort.value": "Valore", "cat.all": "Tutti", "cat.priority": "Priorità", "cat.quests": "Missione", "cat.safe": "Da vendere", "cat.workshop": "Officina", "cat.expedition": "Spedizione" },
    pt: { "nav.items": "Itens", "nav.quests": "Missões", "nav.workshop": "Oficina", "nav.hideout": "Esconderijo", "search.placeholder": "Buscar...", "sort.name": "Nome", "sort.rarity": "Raridade", "sort.value": "Valor", "cat.all": "Todos", "cat.priority": "Prioridade", "cat.quests": "Missão", "cat.safe": "Vender", "cat.workshop": "Oficina", "cat.expedition": "Expedição" },
    ru: { "nav.items": "Предметы", "nav.quests": "Квесты", "nav.workshop": "Мастерская", "nav.hideout": "Убежище", "search.placeholder": "Поиск...", "sort.name": "Имя", "sort.rarity": "Редкость", "sort.value": "Цена", "cat.all": "Все", "cat.priority": "Важно", "cat.quests": "Квест", "cat.safe": "Продать", "cat.workshop": "Крафт", "cat.expedition": "Рейд" },
    ja: { "nav.items": "アイテム", "nav.quests": "クエスト", "nav.workshop": "ワークショップ", "nav.hideout": "隠れ家", "search.placeholder": "検索...", "sort.name": "名前", "sort.rarity": "レア度", "sort.value": "価値", "cat.all": "すべて", "cat.priority": "優先", "cat.quests": "クエスト", "cat.safe": "売却可", "cat.workshop": "ワークショップ", "cat.expedition": "遠征" },
    ko: { "nav.items": "아이템", "nav.quests": "퀘스트", "nav.workshop": "워크숍", "nav.hideout": "은신처", "search.placeholder": "검색...", "sort.name": "이름", "sort.rarity": "희귀도", "sort.value": "가치", "cat.all": "전체", "cat.priority": "우선순위", "cat.quests": "퀘스트", "cat.safe": "판매 가능", "cat.workshop": "워크숍", "cat.expedition": "원정" },
    zh: { "nav.items": "物品", "nav.quests": "任务", "nav.workshop": "工坊", "nav.hideout": "藏身处", "search.placeholder": "搜索...", "sort.name": "名称", "sort.rarity": "稀有度", "sort.value": "价值", "cat.all": "全部", "cat.priority": "优先", "cat.quests": "任务", "cat.safe": "可出售", "cat.workshop": "工坊", "cat.expedition": "探险" },
};

// Fallback for missing keys
export function getTranslation(lang: LanguageCode, key: string): string {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    return dict[key] || TRANSLATIONS['en'][key] || key;
}
