import type { Store } from '@/types';

export const stores: Store[] = [
  {
    id: 'store-1',
    name: '望京店',
    address: '北京市朝阳区望京SOHO T1 一层',
    phone: '010-8888-1001',
    isActive: true,
  },
  {
    id: 'store-2',
    name: '三里屯店',
    address: '北京市朝阳区三里屯太古里南区',
    phone: '010-8888-1002',
    isActive: true,
  },
  {
    id: 'store-3',
    name: '国贸店',
    address: '北京市朝阳区国贸商城三期',
    phone: '010-8888-1003',
    isActive: true,
  },
  {
    id: 'store-4',
    name: '中关村店',
    address: '北京市海淀区中关村广场',
    phone: '010-8888-1004',
    isActive: false,
  },
  {
    id: 'store-5',
    name: '西单店',
    address: '北京市西城区西单大悦城',
    phone: '010-8888-1005',
    isActive: true,
  },
];
