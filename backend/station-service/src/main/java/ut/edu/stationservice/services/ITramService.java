package ut.edu.stationservice.services;

import java.util.List;

import ut.edu.stationservice.models.Tram;

public interface ITramService {
    List<Tram> findByTramId(Long tramId);
    Tram findById(Long id);
    Tram save(Tram pin);
    List<Tram> addNhieuTram(List<Tram> dsTram);
    boolean deleteById(Long id);
    Tram addPin(Tram pin);
    Tram updatePin(Tram pin);
}
