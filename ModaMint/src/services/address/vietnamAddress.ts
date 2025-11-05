// Vietnam Address Data Service
// Using public API: https://provinces.open-api.vn/api/
// Alternative working API: https://api.mysupership.vn/v1/partner/areas/

export interface Province {
    code: number;
    name: string;
    name_en?: string;
    full_name?: string;
    full_name_en?: string;
}

export interface District {
    code: number;
    name: string;
    name_en?: string;
    full_name?: string;
    full_name_en?: string;
    province_code: number;
}

export interface Ward {
    code: number;
    name: string;
    name_en?: string;
    full_name?: string;
    full_name_en?: string;
    district_code: number;
}

// Using working API from esgoo.net
const API_BASE = 'https://esgoo.net/api-tinhthanh';

// Cache to avoid repeated API calls
let cachedProvinces: Province[] | null = null;
let cachedDistricts: Map<number, District[]> = new Map();
let cachedWards: Map<number, Ward[]> = new Map();

export const vietnamAddressService = {
    // Get all provinces
    async getProvinces(): Promise<Province[]> {
        if (cachedProvinces) {
            console.log('📦 Using cached provinces');
            return cachedProvinces;
        }

        try {
            console.log('🌐 Fetching provinces from API...');
            const response = await fetch(`${API_BASE}/1/0.htm`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 API response:', result);
            
            // esgoo API returns { error: 0, data: [...] }
            const data = result.data || [];
            
            // Convert to our format
            const provinces = data.map((p: any) => ({
                code: parseInt(p.id),
                name: p.name,
                full_name: p.full_name || p.name,
            }));
            
            cachedProvinces = provinces;
            console.log('✅ Provinces loaded:', provinces.length);
            return provinces;
        } catch (error) {
            console.error('❌ Error fetching provinces:', error);
            return [];
        }
    },

    // Get districts by province code
    async getDistricts(provinceCode: number): Promise<District[]> {
        if (cachedDistricts.has(provinceCode)) {
            console.log('📦 Using cached districts for province:', provinceCode);
            return cachedDistricts.get(provinceCode)!;
        }

        try {
            console.log('🌐 Fetching districts for province:', provinceCode);
            
            // Format province_id with leading zeros (e.g., 01, 02)
            const provinceId = provinceCode.toString().padStart(2, '0');
            const response = await fetch(`${API_BASE}/2/${provinceId}.htm`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 Districts API response:', result);
            
            const data = result.data || [];
            
            // Convert to our format
            const districts = data.map((d: any) => ({
                code: parseInt(d.id),
                name: d.name,
                full_name: d.full_name || d.name,
                province_code: provinceCode,
            }));
            
            cachedDistricts.set(provinceCode, districts);
            console.log('✅ Districts loaded:', districts.length);
            return districts;
        } catch (error) {
            console.error('❌ Error fetching districts:', error);
            return [];
        }
    },

    // Get wards by district code
    async getWards(districtCode: number): Promise<Ward[]> {
        if (cachedWards.has(districtCode)) {
            console.log('📦 Using cached wards for district:', districtCode);
            return cachedWards.get(districtCode)!;
        }

        try {
            console.log('🌐 Fetching wards for district:', districtCode);
            
            // Format district_id with leading zeros
            const districtId = districtCode.toString().padStart(3, '0');
            const response = await fetch(`${API_BASE}/3/${districtId}.htm`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 Wards API response:', result);
            
            const data = result.data || [];
            
            // Convert to our format
            const wards = data.map((w: any) => ({
                code: parseInt(w.id),
                name: w.name,
                full_name: w.full_name || w.name,
                district_code: districtCode,
            }));
            
            cachedWards.set(districtCode, wards);
            console.log('✅ Wards loaded:', wards.length);
            return wards;
        } catch (error) {
            console.error('❌ Error fetching wards:', error);
            return [];
        }
    },

    // Clear cache
    clearCache() {
        cachedProvinces = null;
        cachedDistricts.clear();
        cachedWards.clear();
    }
};
