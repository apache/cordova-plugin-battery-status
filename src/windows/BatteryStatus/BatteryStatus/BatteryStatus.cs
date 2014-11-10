using System;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using Windows.Phone.Devices.Power;

namespace BatteryStatus
{
    public sealed class BatteryStatus
    {
        private static Battery battery = Battery.GetDefault();

        public static string getBatteryStatus()
        {
            try
            {
                int remainingChargePercent = -1;
                remainingChargePercent = battery.RemainingChargePercent;

                var batteryState = new BatteryInfo
                {
                    Level = remainingChargePercent,
                    IsPlugged = "not implemented"
                };

                return Serialize(typeof(BatteryInfo), batteryState);
            }
            catch (Exception ex)
            {
                return Serialize(typeof(ExceptionInfo), new ExceptionInfo { Message = ex.Message });
            }
        }

        private static string Serialize(Type type, object obj)
        {
            using (var stream = new MemoryStream())
            {
                var jsonSer = new DataContractJsonSerializer(type);
                jsonSer.WriteObject(stream, obj);
                stream.Position = 0;
                return new StreamReader(stream).ReadToEnd();
            }
        }

        [DataContract]
        private class BatteryInfo
        {
            [DataMember(Name = "level")]
            public int Level;

            [DataMember(Name = "isPlugged")]
            public string IsPlugged;
        };

        [DataContract]
        private class ExceptionInfo
        {
            [DataMember(Name = "exceptionMessage")]
            public string Message = string.Empty;
        };
    }
}
