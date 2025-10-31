// Service để lấy danh sách địa chỉ Việt Nam
// Sử dụng package: vietnam-provinces-js

import { Provinces, Districts } from 'vietnam-provinces-js';

export interface Province {
    code: string;
    name: string;
}

export interface District {
    code: string;
    name: string;
    province_code: string;
}

export interface Ward {
    code: string;
    name: string;
    district_code: string;
}

class AddressService {
    // Cached provinces để tránh xử lý lại nhiều lần
    private cachedProvinces: Province[] | null = null;
    private cachedDistricts: Map<string, District[]> = new Map();
    private cachedWards: Map<string, Ward[]> = new Map();

    // Lấy tất cả tỉnh/thành phố
    async getProvinces(): Promise<Province[]> {
        // Trả về cache nếu đã có
        if (this.cachedProvinces) {
            return this.cachedProvinces;
        }
        
        try {
            const provincesData = await Provinces.getAllProvince();
            const provinces: Province[] = provincesData.map((item: any) => ({
                code: String(item.idProvince || item.code || ''),
                name: String(item.name || ''),
            }));
            
            // Cache lại kết quả
            this.cachedProvinces = provinces;
            console.log(`✅ Loaded ${provinces.length} provinces from vietnam-provinces-js`);
            return provinces;
        } catch (error) {
            console.error('❌ Error loading provinces:', error);
            return [];
        }
    }

    // Lấy tất cả quận/huyện theo tỉnh/thành phố
    async getDistrictsByProvince(provinceCode: string): Promise<District[]> {
        // Kiểm tra cache
        if (this.cachedDistricts.has(provinceCode)) {
            return this.cachedDistricts.get(provinceCode)!;
        }
        
        try {
            const districtsData = await Provinces.getDistrictsByProvinceId(provinceCode);
            const districts: District[] = districtsData.map((item: any) => ({
                code: String(item.idDistrict || item.code || ''),
                name: String(item.name || ''),
                province_code: String(item.idProvince || item.province_code || provinceCode),
            }));
            
            // Cache lại kết quả
            this.cachedDistricts.set(provinceCode, districts);
            console.log(`✅ Loaded ${districts.length} districts for province ${provinceCode}`);
            return districts;
        } catch (error) {
            console.error(`❌ Error loading districts for province ${provinceCode}:`, error);
            return [];
        }
    }

    // Lấy tất cả phường/xã theo quận/huyện
    async getWardsByDistrict(districtCode: string): Promise<Ward[]> {
        // Kiểm tra cache
        if (this.cachedWards.has(districtCode)) {
            return this.cachedWards.get(districtCode)!;
        }
        
        try {
            const wardsData = await Districts.getCommunesByDistrictId(districtCode);
            const wards: Ward[] = wardsData.map((item: any) => ({
                code: String(item.idCommune || item.code || ''),
                name: String(item.name || ''),
                district_code: String(item.idDistrict || item.district_code || districtCode),
            }));
            
            // Cache lại kết quả
            this.cachedWards.set(districtCode, wards);
            console.log(`✅ Loaded ${wards.length} wards for district ${districtCode}`);
            return wards;
        } catch (error) {
            console.error(`❌ Error loading wards for district ${districtCode}:`, error);
            return [];
        }
    }

    // Tìm tên tỉnh/thành phố theo code
    async findProvinceByCode(provinceCode: string): Promise<Province | null> { 
        const provinces = await this.getProvinces();
        return provinces.find(p => p.code === provinceCode) || null;
    }

    // Tìm tên quận/huyện theo code
    async findDistrictByCode(districtCode: string, provinceCode: string): Promise<District | null> {
        const districts = await this.getDistrictsByProvince(provinceCode);
        return districts.find(d => d.code === districtCode) || null;
    }

    // Tìm tên phường/xã theo code
    async findWardByCode(wardCode: string, districtCode: string): Promise<Ward | null> {
        const wards = await this.getWardsByDistrict(districtCode);
        return wards.find(w => w.code === wardCode) || null;
    }
    
    // Tìm province code từ name
    async findProvinceCodeByName(provinceName: string): Promise<string | null> {
        const provinces = await this.getProvinces();
        const province = provinces.find(p => 
            p.name === provinceName || 
            p.name.includes(provinceName) ||
            provinceName.includes(p.name)
        );
        return province ? province.code : null;
    }
}

export const addressService = new AddressService();
