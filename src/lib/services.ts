import data from '../../services.json';

export interface AlternateAddress {
  url: string;
  type: 'alias' | 'redirect';
  unavailable?: boolean;
}

export interface Service {
  name: string;
  url: string;
  icon: string;
  desc: string;
  private?: boolean;
  hidden?: boolean;
  alternates?: AlternateAddress[];
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: string;
  cssClass: string;
  allPrivate?: boolean;
  services: Service[];
}

export const categories = data.categories as ServiceCategory[];

export const visibleCategories = categories
  .map(category => ({ ...category, services: category.services.filter(service => !service.hidden) }))
  .filter(category => category.services.length > 0);
