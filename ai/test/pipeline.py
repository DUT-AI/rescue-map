import re
import pandas as pd
# from pydantic import BaseModeluv ins
from ai.models.Train_model_XGBoost import predict as predict_xgboost
from ai.models.Train_model_RandomForest import predict as predict_randomForest
from clean_data import data_clean
from raw_to_dataframe import raw_to_dataframe
from ai.models.Train_model_LightGBM import predict as predict_lbm
from esemble import ensemble_predictions
client = None
def run_processing_data(raw_data_from_bot):
    # Clean data (Trí)
    df_raw_data = raw_to_dataframe(raw_data_from_bot)
    cleaned_data = data_clean(df_raw_data)
    # Use AI to predict urgency score and reliability score(Trinh, Như, Tú) sử dụng bagging để chọn ra nhãn có lượng nhiều hơn (ưu tiên model có độ chính xác cao hơn)
    # (
    #     urgency_score_xgboost,
    #     urgency_prob_xgboost,
    #     reliability_score_xgboost,
    #     reliability_prob_xgboost,
    # ) = predict_xgboost(
    #     cleaned_data, "/home/nguyenhuynh/Documents/appcuuho/be/ai/rescue_model.pkl"
    # )

    # ( 
    #     urgency_score_random_forest, 
    #     urgency_prob_random_forest, 
    #     reliability_score_random_forest, 
    #     reliability_prob_random_forest 
    # ) = predict_randomForest(
    #     cleaned_data, "/home/nguyenhuynh/Documents/appcuuho/be/ai/rescue_model_rf.pkl"
    # )

    res_xgb = predict_xgboost(cleaned_data, "/home/nguyenhuynh/Documents/appcuuho/be/ai/rescue_model.pkl")
    
    # Random Forest (Thêm mới)
    res_rf = predict_randomForest(cleaned_data, "/home/nguyenhuynh/Documents/appcuuho/be/ai/rescue_model_rf.pkl")
    
    # LightGBM (Thêm mới)
    res_lgbm = predict_lbm(cleaned_data, "/home/nguyenhuynh/Documents/appcuuho/be/ai/rescue_model_lightGBM.pkl")

    # Gom tất cả vào một DataFrame tạm để xử lý
    ensemble_df = pd.DataFrame({
        'urgency_score_xgboost': res_xgb[0], 'urgency_prob_xgboost': res_xgb[1],
        'reliability_score_xgboost': res_xgb[2], 'reliability_prob_xgboost': res_xgb[3],
        
        'urgency_score_rf': res_rf[0], 'urgency_prob_rf': res_rf[1],
        'reliability_score_rf': res_rf[2], 'reliability_prob_rf': res_rf[3],
        
        'urgency_score_lgbm': res_lgbm[0], 'urgency_prob_lgbm': res_lgbm[1],
        'reliability_score_lgbm': res_lgbm[2], 'reliability_prob_lgbm': res_lgbm[3]
    })

    # 3. Chọn kết quả tốt nhất (Bagging/Voting logic)
    final_scores = ensemble_predictions(ensemble_df)

    # 4. Merge nhãn cuối cùng vào dữ liệu sạch
    merged_data = pd.concat([cleaned_data, final_scores], axis=1)

    # call API to add data to database(Cường)
    try:
        result = client.import_json_data(merged_data)
        success_count = result.get("success", 0)
        total_count = result.get("total", 0)
        print(f"Đã import {success_count}/{total_count} bản ghi")
    except Exception as e:
        print(f"Lỗi import: {str(e)}")

    pass
