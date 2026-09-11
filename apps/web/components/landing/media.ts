const unsplash = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const IMG = {
  p1: unsplash('photo-1534528741775-53994a69daeb', 700),
  p2: unsplash('photo-1500648767791-00dcc994a43e', 700),
  p3: unsplash('photo-1494790108377-be9c29b29330', 700),
  p4: unsplash('photo-1507003211169-0a1dd7228f2d', 700),
  p5: unsplash('photo-1524504388940-b1c1722653e1', 800),
  p6: unsplash('photo-1517841905240-472988babdf9', 700),
  p7: unsplash('photo-1539571696357-5a69c17a67c6', 700),
  p8: unsplash('photo-1529626455594-4ff0802cfb7e', 700),
  p9: unsplash('photo-1487412720507-e7ab37603c6f', 700),
  p10: unsplash('photo-1544005313-94ddf0286df2', 700),
  p11: unsplash('photo-1506794778202-cad84cf45f1d', 700),
  p12: unsplash('photo-1438761681033-6461ffad8d80', 700),
  p13: unsplash('photo-1531123897727-8f129e1688ce', 700),
  p14: unsplash('photo-1463453091185-61582044d556', 700),
  p15: unsplash('photo-1488426862026-3ee34a7d66df', 700),
  p16: unsplash('photo-1502823403499-6ccfcf4fb453', 700),
  fashion1: unsplash('photo-1515886657613-9f3515e0c046', 1000),
  fashion2: unsplash('photo-1469334031218-e382a71b716b', 1000),
  fashion3: unsplash('photo-1490481651871-ab68de25d43d', 1000),
  lifestyle: unsplash('photo-1483985988355-763728e1935b', 1200),
  watch: unsplash('photo-1523275335684-37898b6baf30', 800),
  sneaker: unsplash('photo-1542291026-7eec264c27ff', 800),
  headphones: unsplash('photo-1505740420928-5e560c06d30e', 800),
  sunglasses: unsplash('photo-1572635196237-14b3f281503f', 800),
  beauty: unsplash('photo-1596462502278-27bfdc403348', 800),
  skincare: unsplash('photo-1556228720-195a672e8a03', 800),
} as const

export const VIDEO = {
  beach: 'https://cdn.pixabay.com/video/2023/07/28/173530-849610807_tiny.mp4',
  tea: 'https://cdn.pixabay.com/video/2023/06/17/167569-837244635_tiny.mp4',
  horses: 'https://cdn.pixabay.com/video/2024/03/31/206294_small.mp4',
  hoop: 'https://cdn.pixabay.com/video/2024/04/18/208442_small.mp4',
  motion: 'https://cdn.pixabay.com/video/2024/03/31/206293_small.mp4',
} as const

export const TALENT = [
  { name: 'Maya', src: IMG.p1 },
  { name: 'Jordan', src: IMG.p2 },
  { name: 'Amina', src: IMG.p3 },
  { name: 'Luca', src: IMG.p4 },
  { name: 'Hana', src: IMG.p5 },
  { name: 'Noah', src: IMG.p7 },
  { name: 'Priya', src: IMG.p9 },
  { name: 'Elias', src: IMG.p11 },
  { name: 'Sofia', src: IMG.p8 },
  { name: 'Kenji', src: IMG.p14 },
  { name: 'Amara', src: IMG.p13 },
  { name: 'Theo', src: IMG.p6 },
] as const
