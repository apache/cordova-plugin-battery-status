/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

#include <QtCore>

#include "battery.h"

BatteryStatus::BatteryStatus(Cordova *cordova)
        : CPlugin(cordova),
          _scId(0) {

    connect(&_batteryInfo,
            SIGNAL(remainingCapacityChanged(int)),
            this,
            SLOT(remainingCapacityChanged(int)));

    connect(&_batteryInfo,
            SIGNAL(batteryCountChanged(int)),
            this,
            SLOT(batteryCountChanged(int)));

    connect(&_batteryInfo,
            SIGNAL(chargerTypeChanged(QBatteryInfo::ChargerType)),
            this,
            SLOT(chargerTypeChanged(QBatteryInfo::ChargerType)));
}

void BatteryStatus::remainingCapacityChanged(int capacity) {
    Q_UNUSED(capacity);

    fireEvents();
}

void BatteryStatus::batteryCountChanged(int count) {
    Q_UNUSED(count);

    fireEvents();
}

void BatteryStatus::chargerTypeChanged(QBatteryInfo::ChargerType type) {
    Q_UNUSED(type);

    fireEvents();
}

void BatteryStatus::fireEvents() {
    int fullCount = 0;
    bool isPlugged = false;

    int remaining = 0, total = 0;
    for (int i = 0; i < _batteryInfo.batteryCount(); i++) {
        QBatteryInfo bi(i);

        if (bi.isValid()) {
          isPlugged = (bi.chargingState() == QBatteryInfo::Charging) || isPlugged;
          fullCount += bi.chargingState() == QBatteryInfo::LevelFull;

          remaining += bi.remainingCapacity();
          total += bi.maximumCapacity();
        }
    }

    isPlugged = isPlugged || (_batteryInfo.batteryCount() == fullCount);

    if (_scId) {
        QVariantMap obj;
        obj.insert("isPlugged", (int)isPlugged);
        if (total != 0)
          obj.insert("level", remaining * 100 / total);
        else
          obj.insert("level", 100);

        this->callbackWithoutRemove(_scId, CordovaInternal::format(obj));
    }
}

void BatteryStatus::start(int scId, int) {
    _scId = scId;
}

void BatteryStatus::stop(int, int) {
    _scId = 0;
}
