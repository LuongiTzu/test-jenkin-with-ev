package ut.edu.batteryservice.services;

import ut.edu.batteryservice.models.Pin;

import java.util.List;

public interface IPinService {
    List <Pin> getAllPinTypes();
    Pin getPinTypeById(Long id);
    Pin createPinType(Pin pin);
    Pin updatePinType(Long id, Pin pin);
    boolean deletePinType(Long id);
    Pin addPin(Pin pin);
    Pin updatePinState(Long id, String tinhTrang, String trangThaiSoHuu);
}
