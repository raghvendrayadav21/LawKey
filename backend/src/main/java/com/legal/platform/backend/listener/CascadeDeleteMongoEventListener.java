package com.legal.platform.backend.listener;

import com.legal.platform.backend.model.Deal;
import com.legal.platform.backend.repository.DealRepository;
import com.legal.platform.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeDeleteEvent;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CascadeDeleteMongoEventListener extends AbstractMongoEventListener<Object> {

    @Autowired
    private DealRepository dealRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Override
    public void onBeforeDelete(BeforeDeleteEvent<Object> event) {
        String collectionName = event.getCollectionName();
        Object idObject = event.getSource().get("_id");

        if (idObject != null) {
            String id = idObject.toString();

            if ("lawyers".equals(collectionName)) {
                // Find all deals associated with this lawyer
                List<Deal> deals = dealRepository.findByLawyerId(id);
                for (Deal deal : deals) {
                    // Delete all messages associated with the deal
                    messageRepository.deleteByDealId(deal.getId());
                    // Delete the deal itself
                    dealRepository.delete(deal);
                }
            } else if ("clients".equals(collectionName)) {
                // Find all deals associated with this client
                List<Deal> deals = dealRepository.findByClientId(id);
                for (Deal deal : deals) {
                    // Delete all messages associated with the deal
                    messageRepository.deleteByDealId(deal.getId());
                    // Delete the deal itself
                    dealRepository.delete(deal);
                }
            } else if ("deals".equals(collectionName)) {
                // If a deal is deleted, also delete its associated messages
                messageRepository.deleteByDealId(id);
            }
        }
    }
}
