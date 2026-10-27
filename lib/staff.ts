type StaffProfile = {
  id: string;
  name: string;
  title: string;
  specialties: readonly string[];
  image: string;
  days: readonly number[];
  open: string;
  close: string;
  breaks: readonly { start: string; end: string }[];
};

export const staff: readonly StaffProfile[] = [
  { id: "jules-martin", name: "Jules Martin", title: "Creative Director", specialties: ["Hair", "Color"], image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=700&q=82", days: [2, 3, 4, 5, 6], open: "09:00", close: "18:00", breaks: [{ start: "13:00", end: "14:00" }] },
  { id: "maya-chen", name: "Maya Chen", title: "Skin & Beauty Specialist", specialties: ["Skin", "Beauty"], image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=700&q=82", days: [2, 3, 4, 5, 6, 0], open: "10:00", close: "17:00", breaks: [{ start: "13:00", end: "13:45" }] },
  { id: "ava-brooks", name: "Ava Brooks", title: "Nail Artist", specialties: ["Nails"], image: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?auto=format&fit=crop&w=700&q=82", days: [2, 3, 4, 5, 6, 0], open: "09:00", close: "18:00", breaks: [{ start: "12:30", end: "13:30" }] },
  { id: "any", name: "Any available artist", title: "We'll find the right person for you", specialties: [], image: "", days: [], open: "00:00", close: "00:00", breaks: [] },
];
