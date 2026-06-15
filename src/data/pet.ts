import type { Pet } from '@/types';

export const petList: Pet[] = [
  {
    id: '1',
    name: '旺财',
    type: 'dog',
    breed: '金毛寻回犬',
    age: 3,
    gender: 'male',
    weight: 28,
    avatar: 'https://picsum.photos/id/237/200/200',
    vaccineStatus: true,
    sterilizationStatus: true
  },
  {
    id: '2',
    name: '咪咪',
    type: 'cat',
    breed: '英国短毛猫',
    age: 2,
    gender: 'female',
    weight: 4.5,
    avatar: 'https://picsum.photos/id/40/200/200',
    vaccineStatus: true,
    sterilizationStatus: false
  }
];

export const currentPet: Pet = petList[0];
